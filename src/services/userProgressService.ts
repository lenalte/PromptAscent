
import { db } from '@/lib/firebase/index';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, writeBatch, type FieldValue } from 'firebase/firestore';
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
      console.log(`[userProgressService.getUserProgress] No progress document found for user ${userId}. Will attempt to create one.`);
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
      // username will be undefined if not in initialData, and thus omitted from firestoreData
    };
    
    const firestoreData: { [key: string]: any } = {
        totalPoints: dataToSet.totalPoints,
        currentLessonId: dataToSet.currentLessonId,
        completedLessons: dataToSet.completedLessons,
        unlockedLessons: dataToSet.unlockedLessons,
    };

    if (initialData?.username) {
        firestoreData.username = initialData.username;
    }

    await setDoc(userDocRef, firestoreData);
    console.log(`[userProgressService.createUserProgressDocument] User progress document created for ${userId} with data:`, firestoreData);
    
    return { userId, ...dataToSet, username: initialData?.username };

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
    
    console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: Fetched allLessonsManifest. Length: ${allLessonsManifest.length}`);
    if (!allLessonsManifest || allLessonsManifest.length === 0) {
      console.error(`[userProgressService.completeLessonInFirestore] CRITICAL ERROR: allLessonsManifest is null or empty after getAvailableLessons(). Cannot determine next lesson. Length: ${allLessonsManifest?.length}`);
      // If manifest is empty, no next lesson can be determined.
      const updates: { [key: string]: any | FieldValue } = {
        completedLessons: arrayUnion(completedLessonId),
        totalPoints: newTotalPointsForUser,
        currentLessonId: completedLessonId, // Stay on current/last completed if no manifest.
      };
      await updateDoc(userDocRef, updates);
      const updatedUserProgressOnError = await getUserProgress(userId);
      if (!updatedUserProgressOnError) throw new Error(`Failed to fetch updated user progress for ${userId} after manifest error.`);
      return { nextLessonId: null, updatedProgress: updatedUserProgressOnError };
    }
    
    console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: completedLessonId = "${completedLessonId}"`);
    console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: allLessonsManifest (length ${allLessonsManifest.length}):`, allLessonsManifest.map(l => l.id).join(', '));
    if (allLessonsManifest.length > 0) {
      console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: First lesson in manifest = "${allLessonsManifest[0]?.id}", Last lesson in manifest = "${allLessonsManifest[allLessonsManifest.length - 1]?.id}"`);
    }

    const completedLessonIndex = allLessonsManifest.findIndex(lesson => lesson.id === completedLessonId);
    console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: completedLessonIndex = ${completedLessonIndex}`);

    let nextLessonId: string | null = null;
    if (completedLessonIndex !== -1 && completedLessonIndex < allLessonsManifest.length - 1) {
      nextLessonId = allLessonsManifest[completedLessonIndex + 1].id;
      console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: Condition for next lesson MET. Determined nextLessonId = "${nextLessonId}"`);
    } else {
      if (completedLessonIndex === -1) {
        console.error(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC CRITICAL: Condition for next lesson NOT MET. Reason: completedLessonIndex is -1. "${completedLessonId}" not found in manifest.`);
      } else if (!(completedLessonIndex < allLessonsManifest.length - 1)) {
        console.log(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC: Condition for next lesson NOT MET. Reason: completedLessonIndex (${completedLessonIndex}) is NOT < allLessonsManifest.length - 1 (${allLessonsManifest.length - 1}). This implies it's the last lesson or manifest is too short.`);
      } else {
        console.error(`[userProgressService.completeLessonInFirestore] DIAGNOSTIC CRITICAL: Condition for next lesson NOT MET for unknown reason. completedLessonIndex: ${completedLessonIndex}, allLessonsManifest.length: ${allLessonsManifest.length}`);
      }
    }
    console.log(`[userProgressService.completeLessonInFirestore] FINAL Determined nextLessonId before Firestore update: "${nextLessonId}"`);

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
      updates.currentLessonId = completedLessonId; 
      console.log(`[userProgressService.completeLessonInFirestore] PREPARED FOR BATCH: No next lesson. CurrentLessonId becomes/stays "${completedLessonId}". Adding to completed: "${completedLessonId}"`);
    }
    
    batch.update(userDocRef, updates);
    await batch.commit();
    console.log(`[userProgressService.completeLessonInFirestore] Firestore batch commit successful for user ${userId}.`);

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
    
    console.log(`[userProgressService.completeLessonInFirestore] Data returned by getUserProgress for context update: nextLessonId: "${nextLessonId}", updatedProgress:`, JSON.stringify(updatedUserProgress, null, 2));
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
    if ('username' in cleanDataToUpdate && cleanDataToUpdate.username === undefined) {
       delete cleanDataToUpdate.username;
    }

    await updateDoc(userDocRef, cleanDataToUpdate);
    console.log(`[userProgressService.updateUserDocument] User document updated for ${userId} with data:`, cleanDataToUpdate);
  } catch (error) {
    console.error(`[userProgressService.updateUserDocument] Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}
