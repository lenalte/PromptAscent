
'use server';

import fs from 'fs/promises';
import path from 'path';
import { generateLessonItems } from '@/ai/flows/generate-lesson-items-flow';
import type { Lesson, LessonItem, LessonStage } from '@/ai/schemas/lesson-schemas'; // Import types from Zod schemas

// Re-export types for use in components
export type { Lesson, LessonItem, LessonStage, FreeResponseLessonItem, MultipleChoiceLessonItem, InformationalSnippetLessonItem, PromptingTaskLessonItem } from '@/ai/schemas/lesson-schemas';
export type { StageItemStatus, StageProgress, StageStatusValue, BossQuestion } from '@/ai/schemas/lesson-schemas';


const LESSON_CONTENT_DIR = path.join(process.cwd(), 'src', 'data', 'lesson-content');
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

// In-memory cache for development to avoid re-reading files constantly.
// This is different from the file-based caching we are implementing.
const lessonCache = new Map<string, Lesson>();

export async function getGeneratedLessonById(lessonId: string): Promise<Lesson | undefined> {
  if (process.env.NODE_ENV === 'development' && lessonCache.has(lessonId)) {
    return lessonCache.get(lessonId);
  }

  const generatedLessonPath = path.join(LESSON_GENERATED_DIR, `${lessonId}.json`);

  // 1. Try to load from the JSON file first
  try {
    const cachedLessonContent = await fs.readFile(generatedLessonPath, 'utf-8');
    const lessonData: Lesson = JSON.parse(cachedLessonContent);
    console.log(`[SERVER LOG] [Lesson: ${lessonId}] Successfully loaded from cached JSON file.`);
    if (process.env.NODE_ENV === 'development') {
      lessonCache.set(lessonId, lessonData);
    }
    return lessonData;
  } catch (error: any) {
    // If file doesn't exist (ENOENT), we generate it. Otherwise, it's a real error.
    if (error.code !== 'ENOENT') {
      console.error(`[SERVER LOG] [Lesson: ${lessonId}] Error reading cached lesson file:`, error);
      throw error; // Rethrow if it's not a "file not found" error
    }
    console.log(`[SERVER LOG] [Lesson: ${lessonId}] No cached JSON found. Proceeding with generation.`);
  }

  // 2. If JSON doesn't exist, generate and save it
  const manifest = await getLessonManifest();
  const lessonEntry = manifest.find(l => l.id === lessonId);

  if (!lessonEntry) {
    console.warn(`[SERVER LOG] [getGeneratedLessonById] Lesson with ID "${lessonId}" not found in manifest.`);
    throw new Error(`Lesson with ID "${lessonId}" not found in manifest.`);
  }

  try {
    const filePath = path.join(LESSON_CONTENT_DIR, lessonEntry.contentFileName);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    const MAX_RETRIES = 3;
    let generatedLessonData: Lesson | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[SERVER LOG] [Lesson: ${lessonId}] Attempt ${attempt}/${MAX_RETRIES} to generate lesson items via AI...`);
        generatedLessonData = await generateLessonItems({
          lessonId: lessonEntry.id,
          lessonTitle: lessonEntry.title,
          lessonDescription: lessonEntry.description,
          rawContent: rawContent,
        });

        // Basic validation of the generated data
        if (generatedLessonData && generatedLessonData.stages && generatedLessonData.stages.length === 6) {
          console.log(`[SERVER LOG] [Lesson: ${lessonId}] Successfully generated lesson on attempt ${attempt}.`);
          break; // Exit loop on success
        } else {
           throw new Error(`AI did not return a valid lesson structure (e.g., not 6 stages).`);
        }
      } catch (error) {
        console.error(`[SERVER LOG] [Lesson: ${lessonId}] AI generation attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
        if (attempt === MAX_RETRIES) {
          throw new Error(`Failed to generate lesson "${lessonId}" after ${MAX_RETRIES} attempts.`);
        }
      }
    }

    if (!generatedLessonData) {
      throw new Error(`Failed to generate lesson "${lessonId}" data after all retries.`);
    }

    // 3. Save the newly generated lesson to a JSON file
    try {
      await fs.mkdir(LESSON_GENERATED_DIR, { recursive: true });
      await fs.writeFile(generatedLessonPath, JSON.stringify(generatedLessonData, null, 2), 'utf-8');
      console.log(`[SERVER LOG] [Lesson: ${lessonId}] Successfully saved newly generated lesson to ${generatedLessonPath}`);
    } catch (saveError) {
      console.error(`[SERVER LOG] [Lesson: ${lessonId}] CRITICAL: Failed to save newly generated lesson to cache file:`, saveError);
      // We don't rethrow here, just return the data so the user can proceed.
      // The next load will try to generate it again.
    }
    
    if (process.env.NODE_ENV === 'development') {
      lessonCache.set(lessonId, generatedLessonData);
    }
    return generatedLessonData;

  } catch (error) {
    console.error(`[SERVER LOG] [Lesson: ${lessonId}] Overall processing failed:`, error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      throw new Error(`Failed to process lesson "${lessonId}": ${error.message}`);
    }
    throw new Error(`Failed to process lesson "${lessonId}" due to an unknown error.`);
  }
}

/**
 * Fetches a specified number of random questions from previous lessons or stages.
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
