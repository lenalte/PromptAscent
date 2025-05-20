
"use client"; // Keep as client component due to extensive state and effects

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
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
// Updated import: getGeneratedLessonById and Lesson/LessonItem types
import { getGeneratedLessonById, type Lesson, type LessonItem } from '@/data/lessons';
import { BrainCircuit, PencilRuler, CheckCircle, ListChecks, Info, BookOpen, HomeIcon, Loader2, FilePenLine, Trophy } from 'lucide-react';

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.lessonId as string;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    const { points, addPoints, deductPoints, setPoints } = usePoints(0);
    const [lessonQueue, setLessonQueue] = useState<LessonItem[]>([]);
    const [currentItem, setCurrentItem] = useState<LessonItem | null>(null);
    const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
    const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
    const [completedItemsMap, setCompletedItemsMap] = useState<Map<number, boolean>>(new Map());
    const [totalLessonItems, setTotalLessonItems] = useState(0);
    const [itemsCompletedCount, setItemsCompletedCount] = useState(0);
    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);


    useEffect(() => {
        async function loadLessonData() {
            if (!lessonId) return;
            setIsLoadingLesson(true);
            setErrorLoadingLesson(null);
            try {
                // Use the new function that calls the AI flow
                const loadedLesson = await getGeneratedLessonById(lessonId);
                if (!loadedLesson) {
                    setErrorLoadingLesson("Lesson not found or failed to load.");
                    notFound(); // Or handle error differently
                } else {
                    setLesson(loadedLesson);
                    const initialItems = [...(loadedLesson.items || [])];
                    setLessonQueue(initialItems);
                    setCurrentItem(initialItems[0] || null);
                    setTotalLessonItems(initialItems.length);
                    setPoints(0);
                    setIsCurrentAttemptSubmitted(false);
                    setLastAnswerCorrectness(null);
                    setCompletedItemsMap(new Map());
                    setItemsCompletedCount(0);
                }
            } catch (err) {
                console.error("Error loading lesson:", err);
                setErrorLoadingLesson(err instanceof Error ? err.message : "An unknown error occurred while loading the lesson.");
            } finally {
                setIsLoadingLesson(false);
            }
        }
        loadLessonData();
    }, [lessonId, setPoints]); // Depend on lessonId and setPoints

    const handleAnswerSubmit = useCallback((isCorrect: boolean) => {
        if (!currentItem || currentItem.type === 'informationalSnippet') return;
        const itemId = currentItem.id;
        if (isCorrect) {
            if (!completedItemsMap.has(itemId)) {
                addPoints(currentItem.pointsAwarded);
                setItemsCompletedCount(prev => prev + 1);
                setCompletedItemsMap(prevMap => new Map(prevMap).set(itemId, true));
            }
            setLastAnswerCorrectness(true);
        } else {
            if (!completedItemsMap.has(itemId) && 'pointsForIncorrect' in currentItem) {
                deductPoints(currentItem.pointsForIncorrect);
            }
            setLastAnswerCorrectness(false);
        }
        setIsCurrentAttemptSubmitted(true);
    }, [currentItem, addPoints, deductPoints, completedItemsMap]);

    const handleNextItem = useCallback(() => {
        if (!currentItem || (currentItem.type !== 'informationalSnippet' && lastAnswerCorrectness === null) ) return;
        const wasCorrectOrAcknowledged = lastAnswerCorrectness;
        const itemJustProcessed = currentItem;
        let nextQueue = lessonQueue.slice(1);
        if (itemJustProcessed.type !== 'informationalSnippet' && !wasCorrectOrAcknowledged && !completedItemsMap.has(itemJustProcessed.id)) {
            nextQueue.push(itemJustProcessed);
        }
        setLessonQueue(nextQueue);
        setCurrentItem(nextQueue[0] || null);
    }, [currentItem, lastAnswerCorrectness, lessonQueue, completedItemsMap]);

    const handleSnippetAcknowledged = useCallback(() => {
        if (!currentItem || currentItem.type !== 'informationalSnippet') return;
        const itemId = currentItem.id;
        if (!completedItemsMap.has(itemId)) {
            addPoints(currentItem.pointsAwarded);
            setItemsCompletedCount(prev => prev + 1);
            setCompletedItemsMap(prevMap => new Map(prevMap).set(itemId, true));
        }
        setLastAnswerCorrectness(true);
        setIsCurrentAttemptSubmitted(true);
        handleNextItem();
    }, [currentItem, addPoints, completedItemsMap, handleNextItem]);

    useEffect(() => {
        if (currentItem) {
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
        }
    }, [currentItem]);

    const allUniqueItemsCompleted = totalLessonItems > 0 && completedItemsMap.size === totalLessonItems;
    const isFinalCompletedItemInQueue = currentItem !== null && lessonQueue.length === 1 && completedItemsMap.has(currentItem.id);
    const isLessonComplete = allUniqueItemsCompleted && currentItem === null;

    const renderLessonItemComponent = () => {
        if (!currentItem) return null;
        const commonPropsBase = {
            id: currentItem.id,
            title: currentItem.title,
            pointsAwarded: currentItem.pointsAwarded,
            isAnswerSubmitted: isCurrentAttemptSubmitted,
            isLastItem: isFinalCompletedItemInQueue,
            onNext: handleNextItem,
            lessonPoints: points,
        };
        const { id: key, ...restCommonProps } = commonPropsBase;

        switch (currentItem.type) {
            case 'freeResponse':
                return (
                    <FreeResponseQuestion
                        key={key}
                        {...restCommonProps}
                        question={currentItem.question}
                        expectedAnswer={currentItem.expectedAnswer}
                        pointsForIncorrect={currentItem.pointsForIncorrect}
                        onAnswerSubmit={handleAnswerSubmit}
                        pointsForCorrect={currentItem.pointsAwarded} // Alias for pointsAwarded
                        onNextQuestion={handleNextItem}
                    />
                );
            case 'multipleChoice':
                return (
                    <MultipleChoiceQuestion
                        key={key}
                        {...restCommonProps}
                        question={currentItem.question}
                        options={currentItem.options}
                        correctOptionIndex={currentItem.correctOptionIndex}
                        pointsForIncorrect={currentItem.pointsForIncorrect}
                        onAnswerSubmit={handleAnswerSubmit}
                        pointsForCorrect={currentItem.pointsAwarded} // Alias for pointsAwarded
                        onNextQuestion={handleNextItem}
                    />
                );
            case 'informationalSnippet':
                return (
                    <InformationalSnippet
                        key={key}
                        {...restCommonProps}
                        content={currentItem.content}
                        onAcknowledged={handleSnippetAcknowledged}
                    />
                );
            case 'promptingTask':
                return (
                    <PromptingTask
                        key={key}
                        {...restCommonProps}
                        taskDescription={currentItem.taskDescription}
                        evaluationGuidance={currentItem.evaluationGuidance}
                        pointsForIncorrect={currentItem.pointsForIncorrect}
                        onAnswerSubmit={handleAnswerSubmit}
                        pointsForCorrect={currentItem.pointsAwarded} // Alias for pointsAwarded
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
    }

    const progressPercentage = totalLessonItems > 0 ? (itemsCompletedCount / totalLessonItems) * 100 : 0;

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
    
    if (!lesson) { // Should be covered by errorLoadingLesson or isLoadingLesson
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

            {totalLessonItems > 0 && !isLessonComplete && (
                <div className="w-full max-w-4xl mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-muted-foreground">Lesson Progress</p>
                        <p className="text-sm font-medium text-primary">
                            {itemsCompletedCount} / {totalLessonItems} items
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
                            <h2 className="text-2xl font-semibold">{currentItem.title}</h2>
                            {getCurrentItemIcon()}
                        </div>
                        {renderLessonItemComponent()}
                    </div>
                ) : (
                    <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
                        {totalLessonItems === 0 && !isLoadingLesson ? "This lesson has no content, or content generation failed." : "Loading next item..."}
                    </div>
                )}
            </div>
        </main>
    );
}
