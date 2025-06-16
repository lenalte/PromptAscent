
import { db } from '@/lib/firebase/index';
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
      const data = userDocSnap.data() as Partial<Omit<UserProgressData, 'userId'>>; // Use Partial for safety
      // Ensure all required fields are present, defaulting if necessary
      return {
        userId,
        username: data.username, // Will be undefined if not present, which is fine for optional field
        totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0, // Default to 0 if missing or not a number
        currentLessonId: data.currentLessonId || "lesson1", // Default if missing
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [], // Default to empty array
        unlockedLessons: Array.isArray(data.unlockedLessons) ? data.unlockedLessons : ["lesson1"], // Default
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

// Function to create a new user progress document in Firestore
export async function createUserProgressDocument(userId: string, initialData?: Partial<Omit<UserProgressData, 'userId'>>): Promise<UserProgressData> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.createUserProgressDocument for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const defaultLessonId = "lesson1";

    // Prepare data to be set, ensuring all non-optional fields have defaults
    const dataToSet: Omit<UserProgressData, 'userId'> = {
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: initialData?.currentLessonId ?? defaultLessonId,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId],
      // username is handled conditionally below
    };

    if (initialData?.username) {
      dataToSet.username = initialData.username;
    }
    // else, dataToSet.username remains undefined, which is fine for Firestore if the field is simply omitted for undefined values.
    // However, when constructing the object to be stored, we need to be careful.

    // Create a clean object for Firestore, omitting username if it's undefined.
    const firestoreData: any = { ...dataToSet };
    if (firestoreData.username === undefined) {
      delete firestoreData.username;
    }


    await setDoc(userDocRef, firestoreData);
    console.log(`User progress document created for ${userId} with data:`, firestoreData);
    
    // Return the full UserProgressData object, including userId and potentially undefined username
    return {
        userId,
        username: dataToSet.username, // This will be undefined if not set
        totalPoints: dataToSet.totalPoints,
        currentLessonId: dataToSet.currentLessonId,
        completedLessons: dataToSet.completedLessons,
        unlockedLessons: dataToSet.unlockedLessons,
    };

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
      // If there's no next lesson, currentLessonId might remain as the completed one,
      // or you might want to set it to a specific state indicating all lessons are done.
      // For now, it implies the current lesson remains the last completed one.
      updates.currentLessonId = completedLessonId; // Or keep as is if currentLessonId isn't meant to change here
      console.log(`User ${userId} completed the last available lesson: ${completedLessonId}`);
    }

    batch.update(userDocRef, updates);
    await batch.commit();

    const updatedDocSnap = await getDoc(userDocRef);
    if (!updatedDocSnap.exists()) {
        throw new Error(`User progress document disappeared after update for UID: ${userId}.`);
    }
    // Construct UserProgressData carefully, ensuring defaults for missing fields
    const data = updatedDocSnap.data() as Partial<Omit<UserProgressData, 'userId'>>;
    const updatedProgress: UserProgressData = {
        userId,
        username: data.username,
        totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
        currentLessonId: data.currentLessonId || "lesson1",
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
        unlockedLessons: Array.isArray(data.unlockedLessons) ? data.unlockedLessons : ["lesson1"],
    };


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
    // Ensure undefined fields are handled if necessary, though updateDoc usually ignores them.
    // For explicit removal, fields can be set to deleteField() but that's not the goal here.
    const cleanDataToUpdate: any = { ...dataToUpdate };
    if (cleanDataToUpdate.username === undefined && 'username' in cleanDataToUpdate) {
        // If you want to remove the username field if it's explicitly set to undefined:
        // import { deleteField } from "firebase/firestore";
        // cleanDataToUpdate.username = deleteField();
        // For now, we assume updateDoc handles undefined by not changing the field or erroring.
        // If username is meant to be optional and potentially absent, ensure UserProgressData reflects that.
        // If username is simply not part of this particular update, it's fine.
    }

    await updateDoc(userDocRef, cleanDataToUpdate);
    console.log(`User document updated for ${userId} with data:`, cleanDataToUpdate);
  } catch (error) {
    console.error(`Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}
