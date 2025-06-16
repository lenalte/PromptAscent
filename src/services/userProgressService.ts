
import { db } from '@/lib/firebase/index.ts';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment, writeBatch } from 'firebase/firestore';
import { getAvailableLessons, type Lesson } from '@/data/lessons'; // For lesson structure

export interface UserProgressData {
  userId: string;
  totalPoints: number;
  currentLessonId: string;
  completedLessons: string[]; // Array of lesson IDs
  unlockedLessons: string[]; // Array of lesson IDs that the user can access
}

const USERS_COLLECTION = 'users';

// Function to get user progress from Firestore
export async function getUserProgress(userId: string): Promise<UserProgressData | null> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.getUserProgress.");
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Explicitly cast to UserProgressData
      const data = userDocSnap.data() as Omit<UserProgressData, 'userId'>; // Firestore won't store userId in the doc itself
      return { userId, ...data };
    } else {
      console.log(`No progress document found for user ${userId}. A new one will be created if needed.`);
      return null; // No document found
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
    throw error;
  }
}

// Function to create a new user progress document in Firestore
export async function createUserProgressDocument(userId: string, initialData?: Partial<Omit<UserProgressData, 'userId'>>): Promise<UserProgressData> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.createUserProgressDocument.");
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const defaultLessonId = "lesson1"; // Ensure there's a default starting point

    const dataToSet: Omit<UserProgressData, 'userId'> = {
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: initialData?.currentLessonId ?? defaultLessonId,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId], // Ensure at least the first lesson is unlocked
    };

    await setDoc(userDocRef, dataToSet);
    console.log(`User progress document created for ${userId} with data:`, dataToSet);
    return { userId, ...dataToSet };
  } catch (error) {
    console.error("Error creating user progress document:", error);
    throw error;
  }
}

// Function to update total points in Firestore
export async function updateTotalPointsInFirestore(userId: string, newTotalPoints: number): Promise<void> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.updateTotalPointsInFirestore.");
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userDocRef, {
      totalPoints: newTotalPoints,
    });
    console.log(`Total points updated to ${newTotalPoints} for user ${userId}`);
  } catch (error) {
    console.error("Error updating total points:", error);
    throw error;
  }
}

// Function to mark a lesson as complete and unlock the next one
export async function completeLessonInFirestore(userId: string, completedLessonId: string, currentTotalPoints: number): Promise<{ nextLessonId: string | null, updatedProgress: UserProgressData }> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.completeLessonInFirestore.");
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const allLessonsManifest = await getAvailableLessons(); // Get the ordered list of all lessons

    const completedLessonIndex = allLessonsManifest.findIndex(lesson => lesson.id === completedLessonId);
    let nextLessonId: string | null = null;
    if (completedLessonIndex !== -1 && completedLessonIndex < allLessonsManifest.length - 1) {
      nextLessonId = allLessonsManifest[completedLessonIndex + 1].id;
    }

    const batch = writeBatch(db);

    // Base updates
    const updates: Partial<Omit<UserProgressData, 'userId'>> = {
      completedLessons: arrayUnion(completedLessonId) as any, // Firestore specific type
      totalPoints: currentTotalPoints, // Assume points passed in are the new total
    };

    // If there's a next lesson, update currentLessonId and add to unlockedLessons
    if (nextLessonId) {
      updates.currentLessonId = nextLessonId;
      updates.unlockedLessons = arrayUnion(nextLessonId) as any;
    } else {
      // If no next lesson, currentLessonId might remain the last completed one or be set to null/special value
      // For now, let's keep it as the last completed lesson if it's the end of the list.
      updates.currentLessonId = completedLessonId;
      console.log(`User ${userId} completed the last available lesson: ${completedLessonId}`);
    }

    batch.update(userDocRef, updates);
    await batch.commit();

    // Fetch the updated document to return the full state
    const updatedDocSnap = await getDoc(userDocRef);
    if (!updatedDocSnap.exists()) {
        throw new Error("User progress document disappeared after update.");
    }
    const updatedProgress = { userId, ...(updatedDocSnap.data() as Omit<UserProgressData, 'userId'>) };

    console.log(`Lesson ${completedLessonId} marked complete for user ${userId}. Next lesson: ${nextLessonId}. Updated progress:`, updatedProgress);
    return { nextLessonId, updatedProgress };

  } catch (error) {
    console.error("Error completing lesson in Firestore:", error);
    throw error;
  }
}
