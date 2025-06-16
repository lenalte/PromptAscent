
import { db } from '@/lib/firebase/index';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, writeBatch, FieldValue } from 'firebase/firestore';
import { getAvailableLessons, type Lesson } from '@/data/lessons'; // For lesson structure

export interface UserProgressData {
  userId: string;
  username?: string;
  totalPoints: number;
  currentLessonId: string;
  completedLessons: string[];
  unlockedLessons: string[];
}

const USERS_COLLECTION = 'users';

export async function getUserProgress(userId: string): Promise<UserProgressData | null> {
  if (!db) {
    console.error("[userProgressService.getUserProgress] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as Partial<Omit<UserProgressData, 'userId'>>;
      return {
        userId,
        username: data.username,
        totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
        currentLessonId: typeof data.currentLessonId === 'string' && data.currentLessonId ? data.currentLessonId : "lesson1",
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
        unlockedLessons: Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0 ? data.unlockedLessons : ["lesson1"],
      };
    } else {
      console.log(`[userProgressService.getUserProgress] No progress document found for user ${userId}.`);
      return null;
    }
  } catch (error) {
    console.error(`[userProgressService.getUserProgress] Error fetching user progress for UID: ${userId}:`, error);
    throw error;
  }
}

export async function createUserProgressDocument(userId: string, initialData?: Partial<Omit<UserProgressData, 'userId'>>): Promise<UserProgressData> {
  if (!db) {
    console.error("[userProgressService.createUserProgressDocument] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const defaultLessonId = "lesson1";

    const dataToSet: Omit<UserProgressData, 'userId'> = {
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: initialData?.currentLessonId ?? defaultLessonId,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId],
      username: initialData?.username,
    };

    const firestoreData: { [key: string]: any } = { ...dataToSet };
    if (firestoreData.username === undefined) {
      // Firestore doesn't store undefined. We can omit the field.
      delete firestoreData.username;
    }

    await setDoc(userDocRef, firestoreData);
    console.log(`[userProgressService.createUserProgressDocument] User progress document created for ${userId} with data:`, firestoreData);
    
    return { userId, ...dataToSet };

  } catch (error) {
    console.error(`[userProgressService.createUserProgressDocument] Error creating user progress document for UID: ${userId} with initialData ${JSON.stringify(initialData)}:`, error);
    throw error;
  }
}


export async function updateTotalPointsInFirestore(userId: string, newTotalPoints: number): Promise<void> {
  if (!db) {
    console.error("[userProgressService.updateTotalPointsInFirestore] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userDocRef, {
      totalPoints: newTotalPoints,
    });
    console.log(`[userProgressService.updateTotalPointsInFirestore] Total points updated to ${newTotalPoints} for user ${userId}`);
  } catch (error) {
    console.error(`[userProgressService.updateTotalPointsInFirestore] Error updating total points for UID: ${userId}:`, error);
    throw error;
  }
}

export async function completeLessonInFirestore(userId: string, completedLessonId: string, newTotalPointsForUser: number): Promise<{ nextLessonId: string | null, updatedProgress: UserProgressData }> {
  if (!db) {
    console.error("[userProgressService.completeLessonInFirestore] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  console.log(`[userProgressService.completeLessonInFirestore] Attempting to complete lesson ${completedLessonId} for user ${userId}. New total points will be ${newTotalPointsForUser}.`);
  
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const allLessonsManifest = await getAvailableLessons(); 
    console.log(`[userProgressService.completeLessonInFirestore] Available lessons manifest (${allLessonsManifest.length}):`, allLessonsManifest.map(l => l.id));

    const completedLessonIndex = allLessonsManifest.findIndex(lesson => lesson.id === completedLessonId);
    console.log(`[userProgressService.completeLessonInFirestore] Index of completed lesson "${completedLessonId}": ${completedLessonIndex}`);

    let nextLessonId: string | null = null;
    if (completedLessonIndex !== -1 && completedLessonIndex < allLessonsManifest.length - 1) {
      nextLessonId = allLessonsManifest[completedLessonIndex + 1].id;
      console.log(`[userProgressService.completeLessonInFirestore] Next lesson ID determined: "${nextLessonId}"`);
    } else if (completedLessonIndex === -1) {
      console.error(`[userProgressService.completeLessonInFirestore] CRITICAL: Completed lesson ID "${completedLessonId}" not found in manifest. Cannot determine next lesson.`);
    } else {
      console.log(`[userProgressService.completeLessonInFirestore] "${completedLessonId}" is the last lesson or manifest issue.`);
    }

    const batch = writeBatch(db);
    const updates: { [key: string]: any | FieldValue } = {
      completedLessons: arrayUnion(completedLessonId),
      totalPoints: newTotalPointsForUser,
    };

    if (nextLessonId) {
      updates.currentLessonId = nextLessonId;
      updates.unlockedLessons = arrayUnion(nextLessonId); 
      console.log(`[userProgressService.completeLessonInFirestore] PREPARED FOR BATCH: Unlocking lesson: "${nextLessonId}" and setting as current. Adding to completed: "${completedLessonId}"`);
    } else {
      updates.currentLessonId = completedLessonId; // Keep current as the last one completed
      console.log(`[userProgressService.completeLessonInFirestore] PREPARED FOR BATCH: No next lesson. CurrentLessonId becomes/stays "${completedLessonId}". Adding to completed: "${completedLessonId}"`);
    }
    
    batch.update(userDocRef, updates);
    await batch.commit();
    console.log(`[userProgressService.completeLessonInFirestore] Firestore batch commit successful for user ${userId}.`);

    // IMMEDIATE POST-COMMIT CHECK
    const postCommitSnap = await getDoc(userDocRef);
    if (postCommitSnap.exists()) {
        const postCommitData = postCommitSnap.data();
        console.log(`[userProgressService.completeLessonInFirestore] IMMEDIATE POST-COMMIT CHECK for ${userId}: 
          currentLessonId: ${postCommitData.currentLessonId}, 
          unlockedLessons: [${(postCommitData.unlockedLessons || []).join(', ')}],
          completedLessons: [${(postCommitData.completedLessons || []).join(', ')}],
          totalPoints: ${postCommitData.totalPoints}
        `);
    } else {
        console.error(`[userProgressService.completeLessonInFirestore] IMMEDIATE POST-COMMIT CHECK for ${userId}: Document NOT FOUND! This is very wrong.`);
    }

    const updatedUserProgress = await getUserProgress(userId);
    if (!updatedUserProgress) {
        console.error(`[userProgressService.completeLessonInFirestore] Failed to fetch updated user progress for ${userId} after lesson completion (via getUserProgress).`);
        throw new Error(`Failed to fetch updated user progress for ${userId}`);
    }
    
    console.log(`[userProgressService.completeLessonInFirestore] Data returned by getUserProgress for context update: nextLessonId: "${nextLessonId}", updatedProgress:`, updatedUserProgress);
    return { nextLessonId, updatedProgress };

  } catch (error) {
    console.error(`[userProgressService.completeLessonInFirestore] Error for UID: ${userId}, lesson: ${completedLessonId}:`, error);
    throw error;
  }
}

export async function updateUserDocument(userId: string, dataToUpdate: Partial<Omit<UserProgressData, 'userId'>>): Promise<void> {
  if (!db) {
    console.error("[userProgressService.updateUserDocument] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    const cleanDataToUpdate: { [key: string]: any } = { ...dataToUpdate };
    if (cleanDataToUpdate.username === undefined && 'username' in cleanDataToUpdate) {
       delete cleanDataToUpdate.username;
    }

    await updateDoc(userDocRef, cleanDataToUpdate);
    console.log(`[userProgressService.updateUserDocument] User document updated for ${userId} with data:`, cleanDataToUpdate);
  } catch (error) {
    console.error(`[userProgressService.updateUserDocument] Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}
