
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
    return [];
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
    return undefined;
  }

  try {
    const filePath = path.join(LESSON_CONTENT_DIR, lessonEntry.contentFileName);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    // Call the Genkit flow to generate lesson items
    const generatedLesson = await generateLessonItems({
      lessonId: lessonEntry.id,
      lessonTitle: lessonEntry.title,
      lessonDescription: lessonEntry.description,
      rawContent: rawContent,
    });
    
    // Validate or further process `generatedLesson` if necessary
    if (!generatedLesson || !generatedLesson.items) {
        throw new Error("AI failed to return valid lesson items.");
    }

    if (process.env.NODE_ENV === 'development') {
      lessonCache.set(lessonId, generatedLesson);
    }
    return generatedLesson;

  } catch (error) {
    console.error(`Error processing lesson "${lessonId}":`, error);
    // Fallback or error handling:
    // Option 1: Return lesson metadata without items
    // return { 
    //   id: lessonEntry.id, 
    //   title: lessonEntry.title, 
    //   description: lessonEntry.description, 
    //   items: [{
    //     id: 1,
    //     type: 'informationalSnippet',
    //     title: 'Error Loading Lesson Content',
    //     content: `There was an error loading or processing the content for this lesson. Details: ${error instanceof Error ? error.message : String(error)}`,
    //     pointsAwarded: 0,
    //   }]
    // };
    // Option 2: Return undefined to let the page handle "not found" or error display
    return undefined;
  }
}
