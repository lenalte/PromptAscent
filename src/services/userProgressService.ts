
'use server';

import { db } from '@/lib/firebase/index';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, writeBatch, type FieldValue } from 'firebase/firestore';
import { getAvailableLessons, getGeneratedLessonById, type Lesson, type StageProgress } from '@/data/lessons'; // Added getGeneratedLessonById

export interface UserProgressData {
  userId: string;
  username?: string;
  totalPoints: number;
  currentLessonId: string; // The ID of the lesson the user is currently on or last accessed
  completedLessons: string[]; // List of lesson IDs fully completed
  unlockedLessons: string[]; // List of lesson IDs the user can access
  // New structure for per-lesson, per-stage progress
  lessonStageProgress: {
    [lessonId: string]: {
      currentStageIndex: number; // 0-5, the stage the user is currently attempting in this lesson
      stages: {
        [stageId: string]: StageProgress; // e.g., "stage1", "stage2"
      };
    };
  };
}

const USERS_COLLECTION = 'users';

// Helper to initialize stage progress for a new lesson
function initializeDefaultStageProgressForLesson(lesson: Lesson): { currentStageIndex: number; stages: { [stageId: string]: StageProgress } } {
  const stagesProgress: { [stageId: string]: StageProgress } = {};
  lesson.stages.forEach((stage, index) => {
    stagesProgress[stage.id] = {
      status: index === 0 ? 'unlocked' : 'locked', // Unlock first stage
      items: {}, // Item attempts will be populated as user interacts
    };
  });
  return {
    currentStageIndex: 0, // Start at the first stage
    stages: stagesProgress,
  };
}

export async function getUserProgress(userId: string): Promise<UserProgressData | null> {
  if (!db) {
    console.error("[SERVER LOG] [userProgressService.getUserProgress] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as Partial<Omit<UserProgressData, 'userId'>>;
      const defaultLessonId = "lesson1";

      // Return data directly from Firestore without triggering AI generation.
      // The frontend or specific user actions will handle initialization if needed.
      return {
        userId,
        username: data.username,
        totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
        currentLessonId: data.currentLessonId || defaultLessonId,
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
        unlockedLessons: Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0 ? data.unlockedLessons : [defaultLessonId],
        lessonStageProgress: data.lessonStageProgress || {},
      };
    } else {
      console.log(`[SERVER LOG] [userProgressService.getUserProgress] No progress document found for user ${userId}. Will attempt to create one.`);
      return null;
    }
  } catch (error) {
    console.error(`[SERVER LOG] [userProgressService.getUserProgress] Error fetching user progress for UID: ${userId}:`, error);
    throw error;
  }
}

export async function createUserProgressDocument(userId: string, initialData?: Partial<Omit<UserProgressData, 'userId'>>): Promise<UserProgressData> {
  if (!db) {
    console.error("[SERVER LOG] [userProgressService.createUserProgressDocument] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const defaultLessonId = "lesson1";
    const currentLessonToInit = initialData?.currentLessonId ?? defaultLessonId;

    let initialLessonStageProgress: UserProgressData['lessonStageProgress'] = {};
    const lessonData = await getGeneratedLessonById(currentLessonToInit);
    if (lessonData) {
        initialLessonStageProgress[currentLessonToInit] = initializeDefaultStageProgressForLesson(lessonData);
    } else {
        console.error(`[SERVER LOG] [userProgressService.createUserProgressDocument] CRITICAL: Could not load lesson data for ${currentLessonToInit} during new user setup.`);
        // Create a fallback empty structure for lessonStageProgress to avoid app crash, but this is an error state.
        initialLessonStageProgress[currentLessonToInit] = { currentStageIndex: 0, stages: {} };
    }


    const dataToSet: UserProgressData = {
      userId,
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: currentLessonToInit,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId],
      username: initialData?.username,
      lessonStageProgress: initialData?.lessonStageProgress ?? initialLessonStageProgress,
    };
    
    // Firestore doesn't like `userId` field in the document itself if doc ID is userId
    const { userId: _, ...firestoreData } = dataToSet; 

    await setDoc(userDocRef, firestoreData);
    console.log(`[SERVER LOG] [userProgressService.createUserProgressDocument] User progress document created for ${userId} with data:`, firestoreData);

    return dataToSet;

  } catch (error) {
    console.error(`[SERVER LOG] [userProgressService.createUserProgressDocument] Error creating user progress document for UID: ${userId} with initialData ${JSON.stringify(initialData)}:`, error);
    throw error;
  }
}


export async function updateUserDocument(userId: string, dataToUpdate: Partial<Omit<UserProgressData, 'userId' | 'lessonStageProgress'> & { lessonStageProgress?: UserProgressData['lessonStageProgress'] }>): Promise<void> {
  if (!db) {
    console.error("[SERVER LOG] [userProgressService.updateUserDocument] Firestore (db) is not available for user:", userId);
    throw new Error("Firestore not initialized");
  }
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);

    const cleanDataToUpdate: { [key: string]: any } = { ...dataToUpdate };
    if ('username' in cleanDataToUpdate && cleanDataToUpdate.username === undefined) {
       delete cleanDataToUpdate.username;
    }
    // For nested objects like lessonStageProgress, ensure specific paths are updated
    // e.g., `lessonStageProgress.lesson1.currentStageIndex`
    // Simple spread might overwrite entire lessonStageProgress if not careful.
    // For now, assuming direct update path if lessonStageProgress is included.
    // Example: updateDoc(userDocRef, { "lessonStageProgress.lesson1.currentStageIndex": 2 });

    await updateDoc(userDocRef, cleanDataToUpdate);
    console.log(`[SERVER LOG] [userProgressService.updateUserDocument] User document updated for ${userId} with data:`, cleanDataToUpdate);
  } catch (error) {
    console.error(`[SERVER LOG] [userProgressService.updateUserDocument] Error updating user document for UID: ${userId}:`, error);
    throw error;
  }
}

export async function completeStageInFirestore(
  userId: string,
  lessonId: string,
  completedStageId: string, // e.g., "stage1"
  completedStageIndex: number, // 0-5
  stageItemsWithStatus: { [itemId: string]: { attempts: number; correct: boolean | null } },
  pointsEarnedThisStage: number
): Promise<{ nextLessonIdIfAny: string | null; updatedProgress: UserProgressData }> {
  if (!db) {
    console.error("[userProgressService.completeStageInFirestore] Firestore (db) is not available.");
    throw new Error("Firestore not initialized");
  }
  console.log(`[UserProgress] Completing stage ${completedStageId} (index ${completedStageIndex}) for lesson ${lessonId}, user ${userId}. Points for stage: ${pointsEarnedThisStage}`);

  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const batch = writeBatch(db);

  try {
    const currentUserProgress = await getUserProgress(userId);
    if (!currentUserProgress) {
      throw new Error(`User progress not found for ${userId} when trying to complete stage.`);
    }

    // Determine stage status (perfect, good, failed)
    let stageStatus: StageProgress['status'] = 'completed-perfect';
    let allPerfect = true;
    let anyFailedMaxAttempts = false;

    const lessonData = await getGeneratedLessonById(lessonId);
    if (!lessonData) throw new Error(`Lesson data for ${lessonId} not found.`);
    const stageItems = lessonData.stages[completedStageIndex]?.items || [];

    for (const item of stageItems) {
      const itemResult = stageItemsWithStatus[item.id];
      if (!itemResult) { // Should not happen if all items are processed
        console.warn(`[UserProgress] Item ${item.id} missing in stageItemsWithStatus for stage ${completedStageId}`);
        allPerfect = false; // Treat missing as not perfect
        continue;
      }
      if (itemResult.correct === false && itemResult.attempts >= 3) {
        anyFailedMaxAttempts = true;
        break; // Stage failed
      }
      if (itemResult.correct === false || itemResult.attempts > 1) {
        allPerfect = false;
      }
    }

    if (anyFailedMaxAttempts) {
      stageStatus = 'failed-stage';
    } else if (!allPerfect) {
      stageStatus = 'completed-good';
    }
    // else it remains 'completed-perfect'

    // Update stage progress in Firestore
    const stageProgressPath = `lessonStageProgress.${lessonId}.stages.${completedStageId}`;
    batch.update(userDocRef, {
      [`${stageProgressPath}.status`]: stageStatus,
      [`${stageProgressPath}.items`]: stageItemsWithStatus, // Overwrite/set all item statuses for this stage
      totalPoints: currentUserProgress.totalPoints + pointsEarnedThisStage,
    });
    console.log(`[UserProgress] Stage ${completedStageId} status: ${stageStatus}. Points added: ${pointsEarnedThisStage}. New total (pending commit): ${currentUserProgress.totalPoints + pointsEarnedThisStage}`);

    let nextLessonIdIfAny: string | null = null;

    if (stageStatus !== 'failed-stage') {
      if (completedStageIndex < 5) { // Not the last stage of the lesson
        const nextStageIndex = completedStageIndex + 1;
        const nextStageId = `stage${nextStageIndex + 1}`; // Assuming stage IDs are "stage1", "stage2", etc.
        batch.update(userDocRef, {
          [`lessonStageProgress.${lessonId}.currentStageIndex`]: nextStageIndex,
          [`lessonStageProgress.${lessonId}.stages.${nextStageId}.status`]: 'unlocked',
        });
        console.log(`[UserProgress] Advancing to stage ${nextStageId} (index ${nextStageIndex}) in lesson ${lessonId}.`);
      } else { // Last stage of the lesson completed successfully
        batch.update(userDocRef, {
          completedLessons: arrayUnion(lessonId),
          // currentLessonId remains this lesson until user navigates away or starts next explicitly
        });
        console.log(`[UserProgress] Lesson ${lessonId} fully completed.`);

        // Unlock next lesson in sequence
        const allLessonsManifest = await getAvailableLessons();
        const currentLessonManifestIndex = allLessonsManifest.findIndex(l => l.id === lessonId);
        if (currentLessonManifestIndex !== -1 && currentLessonManifestIndex < allLessonsManifest.length - 1) {
          const nextLessonToUnlock = allLessonsManifest[currentLessonManifestIndex + 1];
          nextLessonIdIfAny = nextLessonToUnlock.id;
          batch.update(userDocRef, {
            unlockedLessons: arrayUnion(nextLessonToUnlock.id),
            // Optionally, set currentLessonId to the new one if auto-advancing lessons
            // currentLessonId: nextLessonToUnlock.id, 
            // For now, let user explicitly start new lesson.
          });
          const nextLessonData = await getGeneratedLessonById(nextLessonToUnlock.id);
          if (nextLessonData) {
               batch.set(doc(db, USERS_COLLECTION, userId), { // Use set with merge if you want to ensure the structure exists
                lessonStageProgress: {
                    [nextLessonToUnlock.id]: initializeDefaultStageProgressForLesson(nextLessonData)
                }
               }, { merge: true });
          }
          console.log(`[UserProgress] Unlocked next lesson: ${nextLessonToUnlock.id}.`);
        } else {
          console.log(`[UserProgress] Lesson ${lessonId} was the last lesson, or next lesson not found in manifest.`);
        }
      }
    } else {
      // Stage failed, user remains on this stage. No advancement.
      console.log(`[UserProgress] Stage ${completedStageId} of lesson ${lessonId} failed. User remains on this stage.`);
    }

    await batch.commit();
    console.log(`[UserProgress] Firestore batch commit successful for stage completion of ${completedStageId}, lesson ${lessonId}.`);

    const updatedProgress = await getUserProgress(userId);
    if (!updatedProgress) {
      throw new Error(`Failed to fetch updated user progress for ${userId} after stage completion.`);
    }
    console.log(`[UserProgress] Returning updated progress and next lesson ID (if any): ${nextLessonIdIfAny}`);
    return { nextLessonIdIfAny, updatedProgress };

  } catch (error) {
    console.error(`[UserProgress] Error completing stage ${completedStageId} for lesson ${lessonId}, UID ${userId}:`, error);
    throw error;
  }
}

    