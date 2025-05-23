
'use server';

import fs from 'fs/promises';
import path from 'path';
import { generateLessonItems } from '@/ai/flows/generate-lesson-items-flow';
import type { Lesson, LessonItem } from '@/ai/schemas/lesson-schemas'; // Import types from Zod schemas

// Re-export types for use in components
export type { Lesson, LessonItem, FreeResponseLessonItem, MultipleChoiceLessonItem, InformationalSnippetLessonItem, PromptingTaskLessonItem } from '@/ai/schemas/lesson-schemas';

const LESSON_CONTENT_DIR = path.join(process.cwd(), 'src', 'data', 'lesson-content');
const LESSON_MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'lessons-manifest.json');

interface LessonManifestEntry {
  id: string;
  title: string;
  description: string;
  contentFileName: string;
}

// Cache for lesson manifest to avoid repeated file reads in dev
let manifestCache: LessonManifestEntry[] | null = null;

async function getLessonManifest(): Promise<LessonManifestEntry[]> {
  if (process.env.NODE_ENV === 'development' && manifestCache) {
    return manifestCache;
  }
  try {
    const manifestContent = await fs.readFile(LESSON_MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestContent) as LessonManifestEntry[];
    if (process.env.NODE_ENV === 'development') {
      manifestCache = manifest;
    }
    return manifest;
  } catch (error) {
    console.error("Failed to read or parse lesson manifest:", error);
    throw new Error(`Failed to load lesson manifest: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getAvailableLessons(): Promise<Omit<Lesson, 'items'>[]> {
  const manifest = await getLessonManifest();
  return manifest.map(({ id, title, description }) => ({ id, title, description }));
}

// Simple in-memory cache for generated lessons to reduce AI calls during development/session
const lessonCache = new Map<string, Lesson>();

export async function getGeneratedLessonById(lessonId: string): Promise<Lesson | undefined> {
  if (process.env.NODE_ENV === 'development' && lessonCache.has(lessonId)) {
    // console.log(`Returning cached lesson: ${lessonId}`);
    // return lessonCache.get(lessonId);
  }

  const manifest = await getLessonManifest();
  const lessonEntry = manifest.find(l => l.id === lessonId);

  if (!lessonEntry) {
    console.warn(`Lesson with ID "${lessonId}" not found in manifest.`);
    // Throw an error if lesson entry is not found, so it can be caught by the page
    throw new Error(`Lesson with ID "${lessonId}" not found in manifest.`);
  }

  try {
    const filePath = path.join(LESSON_CONTENT_DIR, lessonEntry.contentFileName);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000; // 2 seconds
    let generatedLessonData: Lesson | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Lesson: ${lessonId}] Attempt ${attempt}/${MAX_RETRIES} to generate lesson items...`);
        generatedLessonData = await generateLessonItems({
          lessonId: lessonEntry.id,
          lessonTitle: lessonEntry.title,
          lessonDescription: lessonEntry.description,
          rawContent: rawContent,
        });

        if (generatedLessonData) {
          console.log(`[Lesson: ${lessonId}] Successfully generated lesson items on attempt ${attempt}.`);
          break; // Success, exit retry loop
        } else {
          // This case indicates generateLessonItems resolved to undefined/null without throwing.
          // This should ideally not happen if the flow is robust.
          console.warn(`[Lesson: ${lessonId}] Attempt ${attempt} - generateLessonItems returned no data but did not throw. This is unexpected.`);
          if (attempt === MAX_RETRIES) {
            // If it's the last attempt and still no data, throw an error.
            throw new Error(`AI returned no data for lesson "${lessonId}" after ${MAX_RETRIES} attempts, even without throwing an error during generation.`);
          }
          // Allow loop to continue for another attempt, though this scenario is unusual.
        }
      } catch (error) {
        console.error(`[Lesson: ${lessonId}] Error on attempt ${attempt}/${MAX_RETRIES}:`, error instanceof Error ? error.message : String(error));
        if (attempt < MAX_RETRIES && error instanceof Error &&
          (error.message.includes('503') ||
            error.message.toLowerCase().includes('service unavailable') ||
            error.message.toLowerCase().includes('model is overloaded') ||
            error.message.toLowerCase().includes('try again later'))) {
          console.warn(`[Lesson: ${lessonId}] API overload detected on attempt ${attempt}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          // Not a retryable error or max retries reached (attempt === MAX_RETRIES and error occurred)
          console.error(`[Lesson: ${lessonId}] Max retries reached or non-retryable error on attempt ${attempt}. Propagating error.`);
          throw error; // Re-throw the error to be caught by the outer try-catch
        }
      }
    }

    if (!generatedLessonData) {
      // This fallback should now primarily be hit if generateLessonItems consistently returned undefined/null.
      console.error(`[Lesson: ${lessonId}] Failed to obtain generated lesson data after ${MAX_RETRIES} attempts.`)
      throw new Error(`Failed to generate lesson "${lessonId}" after ${MAX_RETRIES} attempts. The AI did not return structured data.`);
    }

    if (!generatedLessonData.items || generatedLessonData.items.length === 0) {
      console.error(`[Lesson: ${lessonId}] AI returned empty lesson items after successful generation call. Output:`, generatedLessonData);
      throw new Error(`AI failed to return valid and non-empty lesson items for lesson "${lessonId}" after retries.`);
    }

    if (process.env.NODE_ENV === 'development') {
      lessonCache.set(lessonId, generatedLessonData);
    }
    return generatedLessonData;

  } catch (error) { // OUTER CATCH for manifest read, file read, or propagated AI errors
    console.error(`[Lesson: ${lessonId}] Overall processing failed:`, error instanceof Error ? error.message : String(error));
    // Re-throw the error so the page component can catch it and display a specific message.
    if (error instanceof Error) {
      throw new Error(`Failed to process lesson "${lessonId}": ${error.message}`);
    }
    throw new Error(`Failed to process lesson "${lessonId}" due to an unknown error.`);
  }
}
