
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet } from '@/components/InformationalSnippet';
import { PromptingTask } from '@/components/PromptingTask';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { usePoints } from '@/hooks/usePoints';
import { getGeneratedLessonById, type Lesson, type LessonItem as BaseLessonItem } from '@/data/lessons';
import { BrainCircuit, PencilRuler, ListChecks, Info, BookOpen, HomeIcon, Loader2, FilePenLine, Trophy } from 'lucide-react';

// Extend LessonItem for queue management
interface QueuedLessonItem extends BaseLessonItem {
  key: string; // Unique key for React list rendering (originalId + attempt)
  originalItemId: number | string; // The ID from the source lesson data
  originalPointsAwarded: number; // The initial points for this item
  currentAttemptNumber: number; // Starts at 1
  currentPointsToAward: number; // Points for this specific attempt
}


export default function LessonPage() {
    const params = useParams();
    const lessonId = params.lessonId as string;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    const { points, addPoints, deductPoints, setPoints } = usePoints(0); // Lesson-specific points
    
    const [lessonQueue, setLessonQueue] = useState<QueuedLessonItem[]>([]);
    const [currentItem, setCurrentItem] = useState<QueuedLessonItem | null>(null);
    
    const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
    const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
    
    // Tracks completion based on originalItem.id to ensure each unique item is counted once for progress
    const [completedOriginalItemsMap, setCompletedOriginalItemsMap] = useState<Map<number | string, boolean>>(new Map());
    const [totalUniqueLessonItems, setTotalUniqueLessonItems] = useState(0);
    
    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);

    useEffect(() => {
        async function loadLessonData() {
            if (!lessonId) return;
            setIsLoadingLesson(true);
            setErrorLoadingLesson(null);
            try {
                const loadedLesson = await getGeneratedLessonById(lessonId);
                if (!loadedLesson) {
                    setErrorLoadingLesson("Lesson not found or failed to load.");
                    notFound(); 
                } else {
                    setLesson(loadedLesson);
                    const initialQueuedItems: QueuedLessonItem[] = (loadedLesson.items || []).map((item, index) => ({
                        ...item,
                        key: `${item.id}-attempt-1`,
                        originalItemId: item.id,
                        originalPointsAwarded: item.pointsAwarded,
                        currentAttemptNumber: 1,
                        currentPointsToAward: item.pointsAwarded,
                    }));
                    setLessonQueue(initialQueuedItems);
                    setCurrentItem(initialQueuedItems[0] || null);
                    setTotalUniqueLessonItems(initialQueuedItems.length);
                    
                    setPoints(0);
                    setIsCurrentAttemptSubmitted(false);
                    setLastAnswerCorrectness(null);
                    setCompletedOriginalItemsMap(new Map());
                }
            } catch (err) {
                console.error("Error loading lesson:", err);
                setErrorLoadingLesson(err instanceof Error ? err.message : "An unknown error occurred while loading the lesson.");
            } finally {
                setIsLoadingLesson(false);
            }
        }
        loadLessonData();
    }, [lessonId, setPoints]);

    const handleAnswerSubmit = useCallback((isCorrect: boolean) => {
        if (!currentItem || currentItem.type === 'informationalSnippet') return;

        setLastAnswerCorrectness(isCorrect);
        setIsCurrentAttemptSubmitted(true);

        if (isCorrect) {
            addPoints(currentItem.currentPointsToAward);
            if (!completedOriginalItemsMap.has(currentItem.originalItemId)) {
                setCompletedOriginalItemsMap(prevMap => new Map(prevMap).set(currentItem.originalItemId, true));
            }
        }
    }, [currentItem, addPoints, completedOriginalItemsMap]);
    
    const handleNextItem = useCallback(() => {
        if (!currentItem) return;

        // This initial guard prevents proceeding if a question hasn't been submitted.
        // It's a safeguard, as button logic should typically handle "Submit" vs "Next" state.
        if (lastAnswerCorrectness === null && currentItem.type !== 'informationalSnippet') {
            return;
        }

        const itemJustProcessed = currentItem;
        let nextQueue = lessonQueue.slice(1); // Default action: remove current item from head

        // Handle logic for incorrect non-snippet items (questions/tasks)
        if (
            itemJustProcessed.type !== 'informationalSnippet' &&
            lastAnswerCorrectness === false // Item was answered incorrectly
        ) {
            // Check if this item's original version isn't already marked as completed
            // (e.g., if it was somehow attempted again after a correct answer, though current flow doesn't support this)
            if (!completedOriginalItemsMap.has(itemJustProcessed.originalItemId)) {
                if (itemJustProcessed.currentAttemptNumber < 3) {
                    // Item needs to be retried: re-queue it with updated attempt info
                    const nextAttemptNumber = itemJustProcessed.currentAttemptNumber + 1;
                    const originalBaseItem = lesson?.items.find(i => i.id === itemJustProcessed.originalItemId);
                    
                    if (originalBaseItem) {
                        const newPointsToAward = Math.max(0, originalBaseItem.pointsAwarded - (nextAttemptNumber - 1));
                        const retryItem: QueuedLessonItem = {
                            ...(originalBaseItem as BaseLessonItem), // Base properties
                            key: `${itemJustProcessed.originalItemId}-attempt-${nextAttemptNumber}`,
                            originalItemId: itemJustProcessed.originalItemId,
                            originalPointsAwarded: originalBaseItem.pointsAwarded,
                            currentAttemptNumber: nextAttemptNumber,
                            currentPointsToAward: newPointsToAward,
                            // Type-specific properties
                            ...(itemJustProcessed.type === 'freeResponse' && { question: itemJustProcessed.question, expectedAnswer: itemJustProcessed.expectedAnswer }),
                            ...(itemJustProcessed.type === 'multipleChoice' && { question: itemJustProcessed.question, options: itemJustProcessed.options, correctOptionIndex: itemJustProcessed.correctOptionIndex }),
                            ...(itemJustProcessed.type === 'promptingTask' && { taskDescription: itemJustProcessed.taskDescription, evaluationGuidance: itemJustProcessed.evaluationGuidance }),
                        };
                        nextQueue.push(retryItem); // Add to the end of the queue
                    }
                } else {
                    // Max attempts (3) reached for this incorrect item.
                    // Mark its original ID as "completed" for progress tracking.
                    setCompletedOriginalItemsMap(prevMap => new Map(prevMap).set(itemJustProcessed.originalItemId, true));
                }
            }
            // If itemJustProcessed.originalItemId was already in completedOriginalItemsMap, it means it was successfully completed before,
            // so we don't re-queue or change its completion status based on a subsequent incorrect attempt.
            // The item is simply removed from the queue (by lessonQueue.slice(1)) and not re-added.
        }
        // For items that were correct or are informational snippets:
        // - Correct items are marked in completedOriginalItemsMap by handleAnswerSubmit.
        // - Snippets are marked by handleSnippetAcknowledged.
        // - They are then simply removed from the front of the queue by lessonQueue.slice(1).

        setLessonQueue(nextQueue);
        setCurrentItem(nextQueue[0] || null);
        setIsCurrentAttemptSubmitted(false); 
        setLastAnswerCorrectness(null);     

    }, [currentItem, lastAnswerCorrectness, lessonQueue, completedOriginalItemsMap, lesson]);


    const handleSnippetAcknowledged = useCallback(() => {
        if (!currentItem || currentItem.type !== 'informationalSnippet') return;

        if (!completedOriginalItemsMap.has(currentItem.originalItemId)) {
            addPoints(currentItem.currentPointsToAward); 
            setCompletedOriginalItemsMap(prevMap => new Map(prevMap).set(currentItem.originalItemId, true));
        }
        
        setLastAnswerCorrectness(true); 
        setIsCurrentAttemptSubmitted(true);
        handleNextItem(); 
    }, [currentItem, addPoints, completedOriginalItemsMap, handleNextItem]);

    useEffect(() => {
        if (currentItem) {
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
        }
    }, [currentItem?.key]); 

    const itemsCompletedCount = completedOriginalItemsMap.size;
    const allUniqueItemsCompleted = totalUniqueLessonItems > 0 && itemsCompletedCount === totalUniqueLessonItems;
    const isLessonComplete = allUniqueItemsCompleted && currentItem === null && lessonQueue.length === 0;


    const renderLessonItemComponent = () => {
        if (!currentItem) return null;

        const isLastItemInQueueAndCompleted = lessonQueue.length === 1 && completedOriginalItemsMap.has(currentItem.originalItemId);

        const commonProps = {
            title: currentItem.title,
            pointsForCorrect: currentItem.currentPointsToAward, 
            pointsForIncorrect: (currentItem as any).pointsForIncorrect || 0, 
            isAnswerSubmitted: isCurrentAttemptSubmitted,
            isLastItem: isLastItemInQueueAndCompleted, // This might need re-evaluation if it's for "last in whole lesson"
            onNext: handleNextItem, 
            lessonPoints: points, 
        };

        switch (currentItem.type) {
            case 'freeResponse':
                return (
                    <FreeResponseQuestion
                        key={currentItem.key}
                        {...commonProps}
                        id={currentItem.originalItemId} 
                        question={currentItem.question}
                        expectedAnswer={currentItem.expectedAnswer}
                        onAnswerSubmit={handleAnswerSubmit}
                        onNextQuestion={handleNextItem} 
                    />
                );
            case 'multipleChoice':
                return (
                    <MultipleChoiceQuestion
                        key={currentItem.key}
                        {...commonProps}
                        id={currentItem.originalItemId}
                        question={currentItem.question}
                        options={currentItem.options}
                        correctOptionIndex={currentItem.correctOptionIndex}
                        onAnswerSubmit={handleAnswerSubmit}
                        onNextQuestion={handleNextItem}
                    />
                );
            case 'informationalSnippet':
                return (
                    <InformationalSnippet
                        key={currentItem.key}
                        {...commonProps}
                        id={currentItem.originalItemId}
                        content={currentItem.content}
                        pointsAwarded={currentItem.currentPointsToAward} 
                        onAcknowledged={handleSnippetAcknowledged}
                    />
                );
            case 'promptingTask':
                return (
                    <PromptingTask
                        key={currentItem.key}
                        {...commonProps}
                        id={currentItem.originalItemId}
                        taskDescription={currentItem.taskDescription}
                        evaluationGuidance={currentItem.evaluationGuidance}
                        onAnswerSubmit={handleAnswerSubmit}
                        onNextTask={handleNextItem}
                    />
                );
            default:
                const _exhaustiveCheck: never = currentItem;
                console.error("Unknown lesson item type:", _exhaustiveCheck);
                return <div> Error: Unknown lesson item type. </div>;
        }
    };

    const getCurrentItemIcon = () => {
        if (!currentItem) return null;
        switch (currentItem.type) {
            case 'freeResponse': return <PencilRuler className="h-5 w-5 text-muted-foreground" />;
            case 'multipleChoice': return <ListChecks className="h-5 w-5 text-muted-foreground" />;
            case 'informationalSnippet': return <Info className="h-5 w-5 text-muted-foreground" />;
            case 'promptingTask': return <FilePenLine className="h-5 w-5 text-muted-foreground" />;
            default: return <BookOpen className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const progressPercentage = totalUniqueLessonItems > 0 ? (itemsCompletedCount / totalUniqueLessonItems) * 100 : 0;

    if (isLoadingLesson) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Lesson Content...</p>
            </div>
        );
    }

    if (errorLoadingLesson) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <BrainCircuit className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-semibold text-destructive mb-2">Error Loading Lesson</h1>
                <p className="text-muted-foreground mb-6">{errorLoadingLesson}</p>
                <Link href="/" passHref legacyBehavior>
                    <Button variant="outline">
                        <HomeIcon className="mr-2 h-4 w-4" /> Back to Lessons
                    </Button>
                </Link>
            </div>
        );
    }

    if (!lesson) { 
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Preparing Lesson...</p>
            </div>
        );
    }

    return (
        <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
            <div className="w-full max-w-4xl flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" passHref legacyBehavior>
                        <Button variant="outline" size="icon" aria-label="Back to Lessons">
                            <HomeIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-primary">{lesson.title}</h1>
                </div>
                <PointsDisplay points={points} />
            </div>

            <Separator className="my-6 w-full max-w-4xl" />

            {totalUniqueLessonItems > 0 && !isLessonComplete && (
                <div className="w-full max-w-4xl mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-muted-foreground">Lesson Progress</p>
                        <p className="text-sm font-medium text-primary">
                            {itemsCompletedCount} / {totalUniqueLessonItems} items completed
                        </p>
                    </div>
                    <Progress value={progressPercentage} className="w-full h-2 [&>*]:bg-primary" />
                </div>
            )}

            <div className="w-full max-w-4xl">
                {isLessonComplete ? (
                    <LessonCompleteScreen points={points} lessonTitle={lesson.title} />
                ) : currentItem ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {currentItem.title} 
                                {currentItem.currentAttemptNumber > 1 && ` (Attempt ${currentItem.currentAttemptNumber})`}
                            </h2>
                            {getCurrentItemIcon()}
                        </div>
                        {renderLessonItemComponent()}
                    </div>
                ) : (
                     <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
                        {totalUniqueLessonItems === 0 && !isLoadingLesson ? "This lesson has no content, or content generation failed." : 
                         (isLoadingLesson ? "Loading next item..." : "All items processed for now. If the lesson isn't complete, check your progress.")}
                    </div>
                )}
            </div>
        </main>
    );
}

