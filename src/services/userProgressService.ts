
import { db } from '@/lib/firebase/index.ts';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { getAvailableLessons, type Lesson } from '@/data/lessons'; // For lesson structure

export interface UserProgressData {
  userId: string;
  username?: string; // Added username field
  totalPoints: number;
  currentLessonId: string;
  completedLessons: string[]; // Array of lesson IDs
  unlockedLessons: string[]; // Array of lesson IDs that the user can access
}

const USERS_COLLECTION = 'users';

// Function to get user progress from Firestore
export async function getUserProgress(userId: string): Promise<UserProgressData | null> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.getUserProgress for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as Omit<UserProgressData, 'userId'>;
      return { userId, ...data };
    } else {
      console.log(`No progress document found for user ${userId}. A new one will be created if needed.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user progress for UID: ${userId}:`, error);
    throw error;
  }
}

// Function to create a new user progress document in Firestore
export async function createUserProgressDocument(userId: string, initialData?: Partial<Omit<UserProgressData, 'userId'>>): Promise<UserProgressData> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.createUserProgressDocument for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const defaultLessonId = "lesson1";

    // Base data without username
    const baseData: Omit<UserProgressData, 'userId' | 'username'> & { username?: string } = {
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: initialData?.currentLessonId ?? defaultLessonId,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId],
    };

    // Conditionally add username
    const dataToSet: Omit<UserProgressData, 'userId'> = { ...baseData };
    if (initialData?.username) {
      dataToSet.username = initialData.username;
    }

    await setDoc(userDocRef, dataToSet);
    console.log(`User progress document created for ${userId} with data:`, dataToSet);
    // The returned object will have username as undefined if it wasn't in dataToSet, which matches UserProgressData
    return { userId, ...dataToSet } as UserProgressData;
  } catch (error) {
    console.error(`Error creating user progress document for UID: ${userId} with initialData ${JSON.stringify(initialData)}:`, error);
    throw error;
  }
}

// Function to update total points in Firestore
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

// Function to mark a lesson as complete and unlock the next one
export async function completeLessonInFirestore(userId: string, completedLessonId: string, currentTotalPoints: number): Promise<{ nextLessonId: string | null, updatedProgress: UserProgressData }> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.completeLessonInFirestore for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const allLessonsManifest = await getAvailableLessons();

    const completedLessonIndex = allLessonsManifest.findIndex(lesson => lesson.id === completedLessonId);
    let nextLessonId: string | null = null;
    if (completedLessonIndex !== -1 && completedLessonIndex < allLessonsManifest.length - 1) {
      nextLessonId = allLessonsManifest[completedLessonIndex + 1].id;
    }

    const batch = writeBatch(db);

    const updates: Partial<Omit<UserProgressData, 'userId'>> = {
      completedLessons: arrayUnion(completedLessonId) as any,
      totalPoints: currentTotalPoints,
    };

    if (nextLessonId) {
      updates.currentLessonId = nextLessonId;
      updates.unlockedLessons = arrayUnion(nextLessonId) as any;
    } else {
      updates.currentLessonId = completedLessonId;
      console.log(`User ${userId} completed the last available lesson: ${completedLessonId}`);
    }

    batch.update(userDocRef, updates);
    await batch.commit();

    const updatedDocSnap = await getDoc(userDocRef);
    if (!updatedDocSnap.exists()) {
        throw new Error(`User progress document disappeared after update for UID: ${userId}.`);
    }
    const updatedProgress = { userId, ...(updatedDocSnap.data() as Omit<UserProgressData, 'userId'>) };

    console.log(`Lesson ${completedLessonId} marked complete for user ${userId}. Next lesson: ${nextLessonId}. Updated progress:`, updatedProgress);
    return { nextLessonId, updatedProgress };

  } catch (error) {
    console.error(`Error completing lesson ${completedLessonId} for UID: ${userId} in Firestore:`, error);
    throw error;
  }
}

// Function to explicitly update user profile data, e.g., username
export async function updateUserDocument(userId: string, dataToUpdate: Partial<Omit<UserProgressData, 'userId'>>): Promise<void> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.updateUserDocument for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userDocRef, dataToUpdate);
    console.log(`User document updated for ${userId} with data:`, dataToUpdate);
  } catch (error) {
    console.error(`Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}
