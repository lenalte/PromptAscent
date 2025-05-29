"use client";

import React from 'react';
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
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

// Extend LessonItem for queue management using intersection type instead of interface extension
type QueuedLessonItem = BaseLessonItem & {
    key: string; // Unique key for React list rendering (originalId + attempt)
    originalItemId: number | string; // The ID from the source lesson data
    originalPointsAwarded: number; // The initial points for this item
    currentAttemptNumber: number; // Starts at 1
    currentPointsToAward: number; // Points for this specific attempt
};

// Separate type for tracking completion status
type ItemCompletionStatus = {
    id: number | string;
    isCompleted: boolean;
    wasCorrect: boolean;
    attemptCount: number;
};

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

    // Use array instead of Map for better state management
    const [itemCompletionStatus, setItemCompletionStatus] = useState<ItemCompletionStatus[]>([]);
    const [totalUniqueLessonItems, setTotalUniqueLessonItems] = useState(0);

    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Ref to track the last loaded lesson ID to prevent unnecessary reloads
    const lastLoadedLessonId = useRef<string | null>(null);

    // Helper function to get completion status for an item
    const getItemCompletionStatus = useCallback((itemId: number | string): ItemCompletionStatus | undefined => {
        return itemCompletionStatus.find(status => status.id === itemId);
    }, [itemCompletionStatus]);

    // Helper function to check if all items are completed (either correct or failed after 3 attempts)
    const isLessonComplete = useCallback(() => {
        if (totalUniqueLessonItems === 0) return false;

        const completedCount = itemCompletionStatus.filter(status => status.isCompleted).length;
        const queueIsEmpty = lessonQueue.length === 0;

        return completedCount === totalUniqueLessonItems && queueIsEmpty;
    }, [totalUniqueLessonItems, itemCompletionStatus, lessonQueue.length]);

    useEffect(() => {
        async function loadLessonData() {
            if (!lessonId || lessonId === lastLoadedLessonId.current) return;

            setIsLoadingLesson(true);
            setErrorLoadingLesson(null);
            lastLoadedLessonId.current = lessonId;

            try {
                const loadedLesson = await getGeneratedLessonById(lessonId);
                if (!loadedLesson) {
                    setErrorLoadingLesson("Lesson not found or failed to load.");
                    notFound();
                } else {
                    setLesson(loadedLesson);
                    const initialQueuedItems: QueuedLessonItem[] = (loadedLesson.items || []).map((item, index) => ({
                        ...item,
                        key: `${item.id}-attempt-1-${index}-${Date.now()}`,
                        originalItemId: item.id,
                        originalPointsAwarded: item.pointsAwarded,
                        currentAttemptNumber: 1,
                        currentPointsToAward: item.pointsAwarded,
                    }));

                    // Initialize completion status for all items
                    const initialCompletionStatus: ItemCompletionStatus[] = (loadedLesson.items || []).map(item => ({
                        id: item.id,
                        isCompleted: false,
                        wasCorrect: false,
                        attemptCount: 0
                    }));

                    // Reset all state in one batch - avoid multiple state updates
                    setLessonQueue(initialQueuedItems);
                    setCurrentItem(initialQueuedItems[0] || null);
                    setTotalUniqueLessonItems(initialQueuedItems.length);
                    setItemCompletionStatus(initialCompletionStatus);
                    setPoints(0);
                    setIsCurrentAttemptSubmitted(false);
                    setLastAnswerCorrectness(null);
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
        }
    }, [currentItem, addPoints]);

    const handleNextItem = useCallback(() => {
        if (!currentItem || isPending) return;

        const itemJustProcessed = currentItem;
        let nextQueue = [...lessonQueue.slice(1)];

        // Update completion status
        const updatedCompletionStatus = [...itemCompletionStatus];
        const statusIndex = updatedCompletionStatus.findIndex(status => status.id === itemJustProcessed.originalItemId);

        if (statusIndex !== -1) {
            const currentStatus = updatedCompletionStatus[statusIndex];

            // Handle question items (not informational snippets)
            if (itemJustProcessed.type !== 'informationalSnippet') {
                const newAttemptCount = currentStatus.attemptCount + 1;

                if (lastAnswerCorrectness === true) {
                    // Correct answer - mark as completed
                    updatedCompletionStatus[statusIndex] = {
                        ...currentStatus,
                        isCompleted: true,
                        wasCorrect: true,
                        attemptCount: newAttemptCount
                    };
                } else if (lastAnswerCorrectness === false) {
                    // Wrong answer
                    if (newAttemptCount < 3) {
                        // Create retry item
                        const nextAttemptNumber = itemJustProcessed.currentAttemptNumber + 1;
                        const originalBaseItem = lesson?.items.find(i => i.id === itemJustProcessed.originalItemId);

                        if (originalBaseItem) {
                            const newPointsToAward = Math.max(0, originalBaseItem.pointsAwarded - (nextAttemptNumber - 1));
                            const retryItem: QueuedLessonItem = {
                                ...originalBaseItem,
                                key: `${itemJustProcessed.originalItemId}-attempt-${nextAttemptNumber}-${Date.now()}`,
                                originalItemId: itemJustProcessed.originalItemId,
                                originalPointsAwarded: originalBaseItem.pointsAwarded,
                                currentAttemptNumber: nextAttemptNumber,
                                currentPointsToAward: newPointsToAward,
                            };
                            nextQueue = [...nextQueue, retryItem];
                        }

                        // Update attempt count but don't mark as completed yet
                        updatedCompletionStatus[statusIndex] = {
                            ...currentStatus,
                            attemptCount: newAttemptCount
                        };
                    } else {
                        // Third attempt was wrong - mark as completed (failed)
                        updatedCompletionStatus[statusIndex] = {
                            ...currentStatus,
                            isCompleted: true,
                            wasCorrect: false,
                            attemptCount: newAttemptCount
                        };
                    }
                }
            } else {
                // Informational snippet - always mark as completed
                updatedCompletionStatus[statusIndex] = {
                    ...currentStatus,
                    isCompleted: true,
                    wasCorrect: true,
                    attemptCount: 1
                };
            }
        }

        // Update state - using individual setters to avoid race conditions
        setItemCompletionStatus(updatedCompletionStatus);
        setLessonQueue(nextQueue);
        setCurrentItem(nextQueue[0] || null);
        setIsCurrentAttemptSubmitted(false);
        setLastAnswerCorrectness(null);

    }, [currentItem, lastAnswerCorrectness, lessonQueue, itemCompletionStatus, lesson, isPending]);

    const handleSnippetAcknowledged = useCallback(() => {
        if (!currentItem || currentItem.type !== 'informationalSnippet' || isPending) return;

        const currentStatus = getItemCompletionStatus(currentItem.originalItemId);

        // Only add points if not already processed
        if (!currentStatus?.isCompleted) {
            addPoints(currentItem.currentPointsToAward);
        }

        // Set correctness state for consistency
        setLastAnswerCorrectness(true);
        setIsCurrentAttemptSubmitted(true);

        // Use setTimeout to avoid nested state updates
        setTimeout(() => {
            handleNextItem();
        }, 0);

    }, [currentItem, addPoints, getItemCompletionStatus, handleNextItem, isPending]);

    // Reset item-specific state when current item changes
    useEffect(() => {
        if (currentItem) {
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
        }
    }, [currentItem?.key]);

    const renderLessonItemComponent = () => {
        if (!currentItem) return null;

        const completedItems = itemCompletionStatus.filter(status => status.isCompleted);
        const itemsCompletedCount = completedItems.length;
        const currentItemStatus = getItemCompletionStatus(currentItem.originalItemId);
        const isLastItemInQueueAndCompleted = lessonQueue.length === 1 && currentItemStatus?.isCompleted;

        const commonProps = {
            title: currentItem.title,
            pointsForCorrect: currentItem.currentPointsToAward,
            pointsForIncorrect: (currentItem as any).pointsForIncorrect || 0,
            isAnswerSubmitted: isCurrentAttemptSubmitted,
            isLastItem: isLastItemInQueueAndCompleted,
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
                return <div>Error: Unknown lesson item type.</div>;
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

    const completedItems = itemCompletionStatus.filter(status => status.isCompleted);
    const itemsCompletedCount = completedItems.length;
    const progressPercentage = totalUniqueLessonItems > 0 ? (itemsCompletedCount / totalUniqueLessonItems) * 100 : 0;
    const showLessonComplete = isLessonComplete();

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

            {totalUniqueLessonItems > 0 && !showLessonComplete && (
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
                {showLessonComplete ? (
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
                    totalUniqueLessonItems === 0 && !isLoadingLesson && (
                        <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
                            This lesson has no content, or content generation failed.
                        </div>
                    )
                )}
            </div>
        </main>
    );
}