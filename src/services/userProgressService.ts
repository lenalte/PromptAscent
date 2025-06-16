
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
    console.error("Firestore instance (db) is not available in userProgressService.getUserProgress for user:", userId);
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
      console.log(`No progress document found for user ${userId}. A new one will be created if needed.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user progress for UID: ${userId}:`, error);
    throw error;
  }
}

export async function createUserProgressDocument(userId: string, initialData?: Partial<Omit<UserProgressData, 'userId'>>): Promise<UserProgressData> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.createUserProgressDocument for user:", userId);
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
      username: initialData?.username, // Can be undefined
    };

    const firestoreData: { [key: string]: any } = { ...dataToSet };
    if (firestoreData.username === undefined) {
      delete firestoreData.username; // Explicitly remove if undefined
    }

    await setDoc(userDocRef, firestoreData);
    console.log(`User progress document created for ${userId} with data:`, firestoreData);
    
    return {
        userId,
        ...dataToSet, // Spread dataToSet which might have undefined username
    };

  } catch (error) {
    console.error(`Error creating user progress document for UID: ${userId} with initialData ${JSON.stringify(initialData)}:`, error);
    throw error;
  }
}

export async function updateTotalPointsInFirestore(userId: string, newTotalPoints: number): Promise<void> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.updateTotalPointsInFirestore for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userDocRef, {
      totalPoints: newTotalPoints,
    });
    console.log(`Total points updated to ${newTotalPoints} for user ${userId}`);
  } catch (error) {
    console.error(`Error updating total points for UID: ${userId}:`, error);
    throw error;
  }
}

export async function completeLessonInFirestore(userId: string, completedLessonId: string, currentTotalPoints: number): Promise<{ nextLessonId: string | null, updatedProgress: UserProgressData }> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.completeLessonInFirestore for user:", userId);
    throw new Error("Firestore not initialized");
  }
  console.log(`[userProgressService] Attempting to complete lesson ${completedLessonId} for user ${userId} with currentTotalPoints ${currentTotalPoints}.`);
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const allLessonsManifest = await getAvailableLessons();
    console.log(`[userProgressService] Available lessons manifest length: ${allLessonsManifest.length}`);

    const completedLessonIndex = allLessonsManifest.findIndex(lesson => lesson.id === completedLessonId);
    console.log(`[userProgressService] Index of completed lesson "${completedLessonId}": ${completedLessonIndex}`);

    let nextLessonId: string | null = null;
    if (completedLessonIndex !== -1 && completedLessonIndex < allLessonsManifest.length - 1) {
      nextLessonId = allLessonsManifest[completedLessonIndex + 1].id;
      console.log(`[userProgressService] Next lesson ID determined: ${nextLessonId}`);
    } else {
      console.log(`[userProgressService] No next lesson found or "${completedLessonId}" is the last lesson.`);
    }

    const batch = writeBatch(db);
    const updates: { [key: string]: any | FieldValue } = { // More precise type for updates
      completedLessons: arrayUnion(completedLessonId),
      totalPoints: currentTotalPoints,
    };

    if (nextLessonId) {
      updates.currentLessonId = nextLessonId;
      updates.unlockedLessons = arrayUnion(nextLessonId);
    } else {
      updates.currentLessonId = completedLessonId; // Mark current as the last one completed
      console.log(`[userProgressService] User ${userId} completed the last available lesson: ${completedLessonId}. currentLessonId set to ${completedLessonId}.`);
    }
    console.log(`[userProgressService] Firestore batch updates for user ${userId}:`, updates);

    batch.update(userDocRef, updates);
    await batch.commit();
    console.log(`[userProgressService] Firestore batch commit successful for user ${userId}.`);

    const updatedDocSnap = await getDoc(userDocRef);
    if (!updatedDocSnap.exists()) {
        console.error(`[userProgressService] User progress document disappeared after update for UID: ${userId}.`);
        throw new Error(`User progress document not found after update for UID: ${userId}.`);
    }
    const data = updatedDocSnap.data() as Partial<Omit<UserProgressData, 'userId'>>;
    const updatedProgress: UserProgressData = {
        userId,
        username: data.username,
        totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
        currentLessonId: data.currentLessonId || "lesson1",
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
        unlockedLessons: Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0 ? data.unlockedLessons : ["lesson1"],
    };

    console.log(`[userProgressService] completeLessonInFirestore successful:
      User ID: ${userId}
      Completed Lesson ID: ${completedLessonId}
      Determined Next Lesson ID: ${nextLessonId}
      Updated Total Points in DB: ${updatedProgress.totalPoints}
      Updated Unlocked Lessons in DB: ${updatedProgress.unlockedLessons.join(', ')}
      Updated Current Lesson ID in DB: ${updatedProgress.currentLessonId}`);
    return { nextLessonId, updatedProgress };

  } catch (error) {
    console.error(`[userProgressService] Error in completeLessonInFirestore for UID: ${userId}, lesson: ${completedLessonId}:`, error);
    throw error;
  }
}

export async function updateUserDocument(userId: string, dataToUpdate: Partial<Omit<UserProgressData, 'userId'>>): Promise<void> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.updateUserDocument for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const cleanDataToUpdate: { [key: string]: any } = { ...dataToUpdate };
    if (cleanDataToUpdate.username === undefined && 'username' in cleanDataToUpdate) {
       delete cleanDataToUpdate.username;
    }

    await updateDoc(userDocRef, cleanDataToUpdate);
    console.log(`User document updated for ${userId} with data:`, cleanDataToUpdate);
  } catch (error) {
    console.error(`Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}
