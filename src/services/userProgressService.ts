
'use server';

import { db } from '@/lib/firebase/index';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, writeBatch, type FieldValue } from 'firebase/firestore';
import { getAvailableLessons, getQuestionsForBossChallenge, getGeneratedLessonById, type Lesson, type StageProgress, type StageItemStatus, type LessonItem, type BossQuestion } from '@/data/lessons';
import { getRandomBoss, getBossById, type Boss } from '@/data/boss-data';

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
  knowledgeGaps?: { lessonId: string; itemId: string }[]; // For failed boss questions
}

const USERS_COLLECTION = 'users';

// Helper to initialize stage progress for a new lesson without needing the full lesson object.
function createDefaultLessonProgress(isFirstLesson: boolean): { currentStageIndex: number; stages: { [stageId: string]: StageProgress } } {
  const stagesProgress: { [stageId: string]: StageProgress } = {};
  // Boss only appears from stage 2 (index 1) to 6 (index 5) to ensure there's at least one previous stage for questions.
  const bossStageIndex = 1 + Math.floor(Math.random() * 5); 

  for (let i = 0; i < 6; i++) {
    const stageId = `stage${i + 1}`;
    stagesProgress[stageId] = {
      status: i === 0 ? 'unlocked' : 'locked', // Unlock first stage
      items: {}, // Item attempts will be populated as user interacts
      pointsEarned: 0,
    };
    if (i === bossStageIndex && !isFirstLesson) { // No boss on the very first lesson
      const boss = getRandomBoss();
      stagesProgress[stageId].hasBoss = true;
      stagesProgress[stageId].bossDefeated = false;
      stagesProgress[stageId].bossChallenge = {
        bossId: boss.id,
        questionIds: [], // To be populated when challenge starts
        questionStatus: {},
        status: 'pending',
      };
    }
  }
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

      let lessonStageProgress = data.lessonStageProgress || {};
      const currentLesson = data.currentLessonId || defaultLessonId;
      
      // If an existing user doesn't have progress for their current lesson, initialize it in memory.
      if (!lessonStageProgress[currentLesson]) {
        console.warn(`[UserProgress] Progress for lesson ${currentLesson} not found for user ${userId}. Creating in-memory placeholder.`);
        lessonStageProgress[currentLesson] = createDefaultLessonProgress(currentLesson === defaultLessonId);
      }

      return {
        userId,
        username: data.username,
        totalPoints: typeof data.totalPoints === 'number' && !isNaN(data.totalPoints) ? data.totalPoints : 0,
        currentLessonId: currentLesson,
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
        unlockedLessons: Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0 ? data.unlockedLessons : [defaultLessonId],
        lessonStageProgress: lessonStageProgress,
        knowledgeGaps: data.knowledgeGaps ?? [],
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

    const initialLessonStageProgress: UserProgressData['lessonStageProgress'] = {
        [currentLessonToInit]: createDefaultLessonProgress(true) // The first lesson created is always lesson1
    };


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
      knowledgeGaps: initialData?.knowledgeGaps ?? [],
    };
    
    const { userId: _, ...firestoreDataWithMaybeUndefined } = dataToSet;
    const firestoreData: {[key: string]: any} = firestoreDataWithMaybeUndefined;

    if ('username' in firestoreData && firestoreData.username === undefined) {
      delete firestoreData.username;
    }

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
  stageItemsWithStatus: { [itemId: string]: StageItemStatus },
  pointsEarnedThisStage: number,
  stageItems: LessonItem[]
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

    if (!stageItems) throw new Error(`Lesson data for ${lessonId} not found or has no items for stage ${completedStageIndex}.`);

    for (const item of stageItems) {
      const itemResult = stageItemsWithStatus[item.id];
      if (!itemResult) { 
        console.warn(`[UserProgress] Item ${item.id} missing in stageItemsWithStatus for stage ${completedStageId}`);
        allPerfect = false;
        continue;
      }
      if (item.type !== 'informationalSnippet' && itemResult.correct === false && itemResult.attempts >= 3) {
        anyFailedMaxAttempts = true;
        break; 
      }
      if (item.type !== 'informationalSnippet' && (itemResult.correct === false || itemResult.attempts > 1)) {
        allPerfect = false;
      }
    }

    if (anyFailedMaxAttempts) {
      stageStatus = 'failed-stage';
    } else if (!allPerfect) {
      stageStatus = 'completed-good';
    }

    const currentPoints = typeof currentUserProgress.totalPoints === 'number' && !isNaN(currentUserProgress.totalPoints) 
      ? currentUserProgress.totalPoints 
      : 0;

    const updates: { [key: string]: any } = {
      [`lessonStageProgress.${lessonId}.stages.${completedStageId}.status`]: stageStatus,
      [`lessonStageProgress.${lessonId}.stages.${completedStageId}.items`]: stageItemsWithStatus,
      [`lessonStageProgress.${lessonId}.stages.${completedStageId}.pointsEarned`]: pointsEarnedThisStage,
      totalPoints: currentPoints + pointsEarnedThisStage,
    };
    
    console.log(`[UserProgress] Stage ${completedStageId} status: ${stageStatus}. Points added: ${pointsEarnedThisStage}. New total (pending commit): ${currentPoints + pointsEarnedThisStage}`);

    let nextLessonIdIfAny: string | null = null;

    if (stageStatus !== 'failed-stage') {
      if (completedStageIndex < 5) {
        const nextStageIndex = completedStageIndex + 1;
        const nextStageId = `stage${nextStageIndex + 1}`;
        updates[`lessonStageProgress.${lessonId}.currentStageIndex`] = nextStageIndex;
        updates[`lessonStageProgress.${lessonId}.stages.${nextStageId}.status`] = 'unlocked';
        console.log(`[UserProgress] Advancing to stage ${nextStageId} (index ${nextStageIndex}) in lesson ${lessonId}.`);
      } else {
        updates.completedLessons = arrayUnion(lessonId);
        console.log(`[UserProgress] Lesson ${lessonId} fully completed.`);

        const allLessonsManifest = await getAvailableLessons();
        const currentLessonManifestIndex = allLessonsManifest.findIndex(l => l.id === lessonId);
        if (currentLessonManifestIndex !== -1 && currentLessonManifestIndex < allLessonsManifest.length - 1) {
          const nextLessonToUnlock = allLessonsManifest[currentLessonManifestIndex + 1];
          nextLessonIdIfAny = nextLessonToUnlock.id;

          updates.unlockedLessons = arrayUnion(nextLessonToUnlock.id);
          updates.currentLessonId = nextLessonToUnlock.id;

          if (!currentUserProgress.lessonStageProgress[nextLessonToUnlock.id]) {
            updates[`lessonStageProgress.${nextLessonToUnlock.id}`] = createDefaultLessonProgress(false);
          }
          console.log(`[UserProgress] Unlocked and set current to next lesson: ${nextLessonToUnlock.id}.`);
        } else {
          console.log(`[UserProgress] Lesson ${lessonId} was the last lesson, or next lesson not found in manifest.`);
        }
      }
    } else {
      console.log(`[UserProgress] Stage ${completedStageId} of lesson ${lessonId} failed. User remains on this stage.`);
    }

    batch.update(userDocRef, updates);
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

/**
 * Populates a boss challenge with random questions if they haven't been assigned yet.
 */
export async function populateBossChallengeQuestions(
  userId: string,
  lessonId: string,
  stageId: string
): Promise<{ boss: Boss; questions: BossQuestion[]; challenge: StageProgress['bossChallenge'] }> {
  const userProgress = await getUserProgress(userId);
  if (!userProgress) throw new Error("User progress not found.");

  const challenge = userProgress.lessonStageProgress?.[lessonId]?.stages?.[stageId]?.bossChallenge;
  if (!challenge) throw new Error("Boss challenge not found for this stage.");

  const boss = getBossById(challenge.bossId);
  if (!boss) throw new Error("Boss definition not found in library.");

  if (challenge.questionIds && challenge.questionIds.length > 0) {
    console.log("Boss questions already populated. Fetching content.");
    const questions = await Promise.all(
      challenge.questionIds.map(async ({ lessonId, itemId }) => {
        const lesson = await getGeneratedLessonById(lessonId);
        const item = lesson?.stages.flatMap(s => s.items).find(i => i.id === itemId);
        if (!item) throw new Error(`Question item ${itemId} not found in lesson ${lessonId}`);
        return { lessonId, item };
      })
    );
    return { boss, questions, challenge };
  }

  console.log("Populating new boss questions.");
  const numQuestions = 1 + Math.floor(Math.random() * 3); // 1-3 questions
  const currentStageIndex = userProgress.lessonStageProgress[lessonId].currentStageIndex;

  const questions = await getQuestionsForBossChallenge(
    userProgress.completedLessons,
    lessonId,
    currentStageIndex,
    numQuestions
  );

  if (questions.length === 0) {
    console.warn("[getQuestionsForBossChallenge] No questions could be fetched for the boss. Passing boss by default.");
    const updates: { [key: string]: any } = {
        [`lessonStageProgress.${lessonId}.stages.${stageId}.bossDefeated`]: true,
        [`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.status`]: 'passed',
    };
    await updateUserDocument(userId, updates);
    return { boss, questions: [], challenge: {...challenge, status: 'passed', bossDefeated: true }};
  }

  const questionIds = questions.map(q => ({ lessonId: q.lessonId, itemId: q.item.id }));
  const questionStatus: StageProgress['bossChallenge']['questionStatus'] = {};
  questions.forEach(q => {
    questionStatus[q.item.id] = { correct: null, attempts: 0 };
  });

  const updates: { [key: string]: any } = {
    [`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.questionIds`]: questionIds,
    [`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.questionStatus`]: questionStatus,
    [`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.status`]: 'in-progress',
  };

  await updateUserDocument(userId, updates);
  
  const updatedProgress = await getUserProgress(userId);
  const updatedChallenge = updatedProgress!.lessonStageProgress[lessonId].stages[stageId].bossChallenge;

  return { boss, questions, challenge: updatedChallenge! };
}


/**
 * Resolves a boss challenge after the user has completed it.
 */
export async function resolveBossChallenge(
  userId: string,
  lessonId: string,
  stageId: string,
  finalStatus: 'passed' | 'failed',
  finalQuestionStatus: { [itemId: string]: { correct: boolean | null; attempts: number } }
): Promise<UserProgressData> {
  const userProgress = await getUserProgress(userId);
  if (!userProgress) throw new Error("User progress not found.");
  const challenge = userProgress.lessonStageProgress?.[lessonId]?.stages?.[stageId]?.bossChallenge;
  if (!challenge) throw new Error("Boss challenge not found.");
  const boss = getBossById(challenge.bossId);
  if (!boss) throw new Error("Boss definition not found.");

  const batch = writeBatch(db);
  const userDocRef = doc(db, USERS_COLLECTION, userId);

  const updates: { [key: string]: any } = {
    [`lessonStageProgress.${lessonId}.stages.${stageId}.bossDefeated`]: finalStatus === 'passed',
    [`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.status`]: finalStatus,
    [`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.questionStatus`]: finalQuestionStatus,
  };
  
  if (finalStatus === 'passed') {
    const currentPoints = typeof userProgress.totalPoints === 'number' && !isNaN(userProgress.totalPoints)
      ? userProgress.totalPoints
      : 0;
    updates.totalPoints = currentPoints + boss.bonusPoints;
    updates[`lessonStageProgress.${lessonId}.stages.${stageId}.bossChallenge.bonusPointsAwarded`] = boss.bonusPoints;
  } else {
    // Mark failed questions as knowledge gaps
    const gapsToAdd: { lessonId: string; itemId: string }[] = [];
    for (const qId of Object.keys(finalQuestionStatus)) {
      if (finalQuestionStatus[qId].correct === false) {
        const questionRef = challenge.questionIds.find(ref => ref.itemId === qId);
        if (questionRef) {
          gapsToAdd.push(questionRef);
        }
      }
    }
    if (gapsToAdd.length > 0) {
      updates.knowledgeGaps = arrayUnion(...gapsToAdd);
    }
  }

  batch.update(userDocRef, updates);
  await batch.commit();

  const finalProgress = await getUserProgress(userId);
  if (!finalProgress) throw new Error("Failed to get final progress after resolving boss.");

  return finalProgress;
}
