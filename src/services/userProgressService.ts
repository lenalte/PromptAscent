
'use server';

import { db } from '@/lib/firebase/index';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, writeBatch, type FieldValue } from 'firebase/firestore';
import { getAvailableLessons, type Lesson, type StageProgress, type LessonItem } from '@/data/lessons';

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

    const dataToSet: UserProgressData = {
      userId,
      totalPoints: initialData?.totalPoints ?? 0,
      currentLessonId: initialData?.currentLessonId ?? defaultLessonId,
      completedLessons: initialData?.completedLessons ?? [],
      unlockedLessons: initialData?.unlockedLessons && initialData.unlockedLessons.length > 0
        ? initialData.unlockedLessons
        : [defaultLessonId],
      username: initialData?.username,
      lessonStageProgress: initialData?.lessonStageProgress ?? {},
    };
    
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
  pointsEarnedThisStage: number,
  stageItems: LessonItem[] // Passed from client
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

    let stageStatus: StageProgress['status'] = 'completed-perfect';
    let allPerfect = true;
    let anyFailedMaxAttempts = false;

    for (const item of stageItems) {
      const itemResult = stageItemsWithStatus[item.id];
      if (!itemResult) {
        console.warn(`[UserProgress] Item ${item.id} missing in stageItemsWithStatus for stage ${completedStageId}`);
        allPerfect = false; 
        continue;
      }
      if (itemResult.correct === false && itemResult.attempts >= 3) {
        anyFailedMaxAttempts = true;
        break; 
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

    const stageProgressPath = `lessonStageProgress.${lessonId}.stages.${completedStageId}`;
    batch.update(userDocRef, {
      [`${stageProgressPath}.status`]: stageStatus,
      [`${stageProgressPath}.items`]: stageItemsWithStatus,
      totalPoints: currentUserProgress.totalPoints + pointsEarnedThisStage,
    });
    console.log(`[UserProgress] Stage ${completedStageId} status: ${stageStatus}. Points added: ${pointsEarnedThisStage}. New total (pending commit): ${currentUserProgress.totalPoints + pointsEarnedThisStage}`);

    let nextLessonIdIfAny: string | null = null;

    if (stageStatus !== 'failed-stage') {
      if (completedStageIndex < 5) {
        const nextStageIndex = completedStageIndex + 1;
        const nextStageId = `stage${nextStageIndex + 1}`;
        batch.update(userDocRef, {
          [`lessonStageProgress.${lessonId}.currentStageIndex`]: nextStageIndex,
          [`lessonStageProgress.${lessonId}.stages.${nextStageId}.status`]: 'unlocked',
        });
        console.log(`[UserProgress] Advancing to stage ${nextStageId} (index ${nextStageIndex}) in lesson ${lessonId}.`);
      } else {
        batch.update(userDocRef, {
          completedLessons: arrayUnion(lessonId),
        });
        console.log(`[UserProgress] Lesson ${lessonId} fully completed.`);

        const allLessonsManifest = await getAvailableLessons();
        const currentLessonManifestIndex = allLessonsManifest.findIndex(l => l.id === lessonId);
        if (currentLessonManifestIndex !== -1 && currentLessonManifestIndex < allLessonsManifest.length - 1) {
          const nextLessonToUnlock = allLessonsManifest[currentLessonManifestIndex + 1];
          nextLessonIdIfAny = nextLessonToUnlock.id;
          batch.update(userDocRef, {
            unlockedLessons: arrayUnion(nextLessonToUnlock.id),
          });
          console.log(`[UserProgress] Unlocked next lesson: ${nextLessonToUnlock.id}. Progress will be initialized on first access.`);
        } else {
          console.log(`[UserProgress] Lesson ${lessonId} was the last lesson, or next lesson not found in manifest.`);
        }
      }
    } else {
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
