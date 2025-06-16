
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
      // Ensure all fields have defaults if missing from Firestore, crucial for consistency
      return {
        userId,
        username: data.username, // Can be undefined
        totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
        currentLessonId: typeof data.currentLessonId === 'string' && data.currentLessonId ? data.currentLessonId : "lesson1", // Default to "lesson1"
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
        unlockedLessons: Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0 ? data.unlockedLessons : ["lesson1"], // Default to ["lesson1"]
      };
    } else {
      console.log(`[userProgressService] No progress document found for user ${userId}.`);
      return null; // Explicitly return null if no document exists, createUserProgressDocument will handle creation
    }
  } catch (error) {
    console.error(`[userProgressService] Error fetching user progress for UID: ${userId}:`, error);
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
    const defaultLessonId = "lesson1"; // Define a default starting lesson

    // Construct the data ensuring all fields are present, even if with default values
    const dataToSet: Omit<UserProgressData, 'userId'> = {
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: initialData?.currentLessonId ?? defaultLessonId,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId], // Ensure "lesson1" is always unlocked initially
      username: initialData?.username, // This can be undefined
    };

    // For Firestore, explicitly remove undefined fields or ensure they are allowed by rules (null is better)
    const firestoreData: { [key: string]: any } = { ...dataToSet };
    if (firestoreData.username === undefined) {
      // Firestore doesn't store undefined. Either remove or set to null if your schema allows.
      // For new users, not having a username field is fine until they set one.
      delete firestoreData.username;
    }


    await setDoc(userDocRef, firestoreData);
    console.log(`[userProgressService] User progress document created for ${userId} with data:`, firestoreData);
    
    // Return the full UserProgressData structure
    return {
        userId,
        username: dataToSet.username, // This will be undefined if not provided
        totalPoints: dataToSet.totalPoints,
        currentLessonId: dataToSet.currentLessonId,
        completedLessons: dataToSet.completedLessons,
        unlockedLessons: dataToSet.unlockedLessons,
    };

  } catch (error) {
    console.error(`[userProgressService] Error creating user progress document for UID: ${userId} with initialData ${JSON.stringify(initialData)}:`, error);
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
    console.log(`[userProgressService] Total points updated to ${newTotalPoints} for user ${userId}`);
  } catch (error) {
    console.error(`[userProgressService] Error updating total points for UID: ${userId}:`, error);
    throw error;
  }
}

export async function completeLessonInFirestore(userId: string, completedLessonId: string, newTotalPointsForUser: number): Promise<{ nextLessonId: string | null, updatedProgress: UserProgressData }> {
  if (!db) {
    console.error("Firestore instance (db) is not available in userProgressService.completeLessonInFirestore for user:", userId);
    throw new Error("Firestore not initialized");
  }
  console.log(`[userProgressService] Attempting to complete lesson ${completedLessonId} for user ${userId}. New total points will be ${newTotalPointsForUser}.`);
  
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const allLessonsManifest = await getAvailableLessons(); // Assumes this returns lessons in order
    console.log(`[userProgressService] Available lessons manifest (${allLessonsManifest.length}):`, allLessonsManifest.map(l => l.id));

    const completedLessonIndex = allLessonsManifest.findIndex(lesson => lesson.id === completedLessonId);
    console.log(`[userProgressService] Index of completed lesson "${completedLessonId}": ${completedLessonIndex}`);

    let nextLessonId: string | null = null;
    if (completedLessonIndex !== -1 && completedLessonIndex < allLessonsManifest.length - 1) {
      nextLessonId = allLessonsManifest[completedLessonIndex + 1].id;
      console.log(`[userProgressService] Next lesson ID determined: ${nextLessonId}`);
    } else if (completedLessonIndex === -1) {
      console.error(`[userProgressService] CRITICAL: Completed lesson ID "${completedLessonId}" not found in manifest. Cannot determine next lesson.`);
      // Potentially throw error or handle as if it's the last lesson to prevent broken state
    } else {
      console.log(`[userProgressService] "${completedLessonId}" is the last lesson or not found correctly.`);
    }

    const batch = writeBatch(db);
    const updates: { [key: string]: any | FieldValue } = {
      completedLessons: arrayUnion(completedLessonId),
      totalPoints: newTotalPointsForUser, // Use the new total points passed in
    };

    if (nextLessonId) {
      updates.currentLessonId = nextLessonId;
      updates.unlockedLessons = arrayUnion(nextLessonId); // Unlock the next lesson
      console.log(`[userProgressService] Unlocking next lesson: ${nextLessonId} and setting as current.`);
    } else {
      // If no next lesson, currentLessonId might remain the one just completed,
      // or set to a special marker if all lessons are done.
      // For now, we'll just ensure completedLessons includes this one.
      updates.currentLessonId = completedLessonId; // Mark current as the last one completed
      console.log(`[userProgressService] User ${userId} completed the last available lesson: ${completedLessonId}. currentLessonId set to ${completedLessonId}. No new lesson to unlock.`);
    }
    console.log(`[userProgressService] Firestore batch updates for user ${userId}:`, updates);

    batch.update(userDocRef, updates);
    await batch.commit();
    console.log(`[userProgressService] Firestore batch commit successful for user ${userId}.`);

    // Fetch the updated document to return the latest state
    const updatedUserProgress = await getUserProgress(userId);
    if (!updatedUserProgress) {
        console.error(`[userProgressService] Failed to fetch updated user progress for ${userId} after lesson completion.`);
        throw new Error(`Failed to fetch updated user progress for ${userId}`);
    }
    
    console.log(`[userProgressService] completeLessonInFirestore successful. Returning nextLessonId: ${nextLessonId} and updatedProgress:`, updatedUserProgress);
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
    // Firestore doesn't allow 'undefined' values. Remove them or convert to null.
    // If username is explicitly set to undefined, it means we want to remove it (or it wasn't provided)
    if (cleanDataToUpdate.username === undefined && 'username' in cleanDataToUpdate) {
       delete cleanDataToUpdate.username;
    }
    // Add similar checks for other optional fields if necessary

    await updateDoc(userDocRef, cleanDataToUpdate);
    console.log(`[userProgressService] User document updated for ${userId} with data:`, cleanDataToUpdate);
  } catch (error) {
    console.error(`[userProgressService] Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}
