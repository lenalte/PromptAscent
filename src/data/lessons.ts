
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Lesson, LessonItem, LessonStage } from '@/ai/schemas/lesson-schemas'; // Import types from Zod schemas

// Re-export types for use in components
export type { Lesson, LessonItem, LessonStage, FreeResponseLessonItem, MultipleChoiceLessonItem, InformationalSnippetLessonItem, PromptingTaskLessonItem } from '@/ai/schemas/lesson-schemas';
export type { StageItemStatus, StageProgress, StageStatusValue, BossQuestion } from '@/ai/schemas/lesson-schemas';


const LESSON_GENERATED_DIR = path.join(process.cwd(), 'src', 'data', 'generated-lessons');
const LESSON_MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'lessons-manifest.json');
const LESSON_SUMMARIES_PATH = path.join(process.cwd(), 'src', 'data', 'lesson-summaries.json');


interface LessonManifestEntry {
  id: string;
  title: string;
  description: string;
  contentFileName: string;
}

export interface LessonSummary {
  id: string;
  title: string;
  summary: string;
}

async function getLessonManifest(): Promise<LessonManifestEntry[]> {
  console.log('[SERVER LOG] [getLessonManifest] Attempting to read lesson manifest.');
  console.log(`[SERVER LOG] [getLessonManifest] Reading from path: ${LESSON_MANIFEST_PATH}`);
  try {
    const manifestContent = await fs.readFile(LESSON_MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestContent) as LessonManifestEntry[];
    console.log(`[SERVER LOG] [getLessonManifest] Successfully parsed lesson manifest. Number of entries: ${manifest.length}`);
    if (manifest.length === 0) {
        console.warn("[SERVER LOG] [getLessonManifest] WARNING: Parsed manifest is empty.");
    }
    return manifest;
  } catch (error) {
    console.error("[SERVER LOG] [getLessonManifest] CRITICAL: Failed to read or parse lesson manifest:", error);
    return [];
  }
}

export async function getLessonSummaries(): Promise<LessonSummary[]> {
  try {
    const summariesContent = await fs.readFile(LESSON_SUMMARIES_PATH, 'utf-8');
    const summaries = JSON.parse(summariesContent) as LessonSummary[];
    return summaries;
  } catch (error) {
    console.error("[SERVER LOG] [getLessonSummaries] Failed to read or parse lesson summaries:", error);
    return [];
  }
}

export async function getAvailableLessons(): Promise<Omit<Lesson, 'stages'>[]> {
  console.log('[SERVER LOG] [getAvailableLessons] Attempting to get available lessons.');
  const manifest = await getLessonManifest();
  console.log(`[SERVER LOG] [getAvailableLessons] Manifest received in getAvailableLessons. Length: ${manifest.length}`);
  if (manifest.length === 0) {
    console.warn("[SERVER LOG] [getAvailableLessons] WARNING: The lesson manifest is empty. This will lead to issues in lesson progression and display.");
  }
  return manifest.map(({ id, title, description }) => ({ id, title, description }));
}


export async function getGeneratedLessonById(lessonId: string): Promise<Lesson | undefined> {
  const generatedLessonPath = path.join(LESSON_GENERATED_DIR, `${lessonId}.json`);

  try {
    const lessonContent = await fs.readFile(generatedLessonPath, 'utf-8');
    const lessonData: Lesson = JSON.parse(lessonContent);
    console.log(`[SERVER LOG] [Lesson: ${lessonId}] Successfully loaded from JSON file.`);
    return lessonData;
  } catch (error: any) {
    console.error(`[SERVER LOG] [Lesson: ${lessonId}] Error reading lesson file:`, error);
    if (error.code === 'ENOENT') {
        throw new Error(`Lesson content for ${lessonId} not found. Pre-generation is required.`);
    }
    throw error;
  }
}

/**
 * Fetches a specified number of random questions from previous lessons or stages.
 * This now filters out reflection-style questions.
 */
export async function getQuestionsForBossChallenge(
  completedLessonIds: string[],
  currentLessonId: string,
  currentStageIndex: number,
  count: number
): Promise<{ lessonId: string; item: LessonItem }[]> {
  const allQuestions: { lessonId: string; item: LessonItem }[] = [];

  const processLesson = (lesson: Lesson, lessonId: string, maxStageIndex?: number) => {
    lesson.stages.slice(0, maxStageIndex).forEach(stage => {
      stage.items.forEach(item => {
        if (item.type === 'multipleChoice' || item.type === 'freeResponse') {
          // Filter out reflection questions
          if (item.type === 'freeResponse' && item.question.includes('Was sind deine wichtigsten Erkenntnisse')) {
            return; // Skip this item
          }
          allQuestions.push({ lessonId, item });
        }
      });
    });
  };

  if (completedLessonIds.length > 0) {
    // Fetch questions from all completed lessons
    const lessons = await Promise.all(
      completedLessonIds.map(id => getGeneratedLessonById(id))
    );
    lessons.forEach((lesson, index) => {
      if (lesson) {
        processLesson(lesson, completedLessonIds[index]);
      }
    });
  } else {
    // No completed lessons (e.g., on lesson 1), fetch from previous stages of the current lesson
    if (currentStageIndex > 0) {
      const currentLesson = await getGeneratedLessonById(currentLessonId);
      if (currentLesson) {
        processLesson(currentLesson, currentLessonId, currentStageIndex);
      }
    }
  }

  // If still no questions, it's an issue (e.g., boss on stage 1 of lesson 1)
  if (allQuestions.length === 0) {
    console.warn("[getQuestionsForBossChallenge] No questions found for boss challenge. This may happen if the boss is on the first stage of the first lesson.");
    return [];
  }

  // Shuffle and pick `count` questions
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
