
"use client";

import type React from 'react'; // Import type React
import { useState, useEffect, useCallback }
from 'react';
import { useParams, notFound, useRouter }
from 'next/navigation'; // Import hooks
import Link from 'next/link';
import { FreeResponseQuestion }
from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion }
from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet }
from '@/components/InformationalSnippet';
import { PromptingTask } from '@/components/PromptingTask'; // Import PromptingTask
import { PointsDisplay }
from '@/components/PointsDisplay';
import { LessonCompleteScreen }
from '@/components/LessonCompleteScreen';
import { Separator }
from '@/components/ui/separator';
import { Button }
from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { usePoints }
from '@/hooks/usePoints';
import { getLessonById, type Lesson, type LessonItem }
from '@/data/lessons'; // Import lesson data and types
import { BrainCircuit, PencilRuler, CheckCircle, ListChecks, Info, BookOpen, HomeIcon, Loader2, FilePenLine }
from 'lucide-react'; // Added Loader2 and FilePenLine

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.lessonId as string; // Get lessonId from URL

    const [lesson, setLesson] = useState < Lesson | null > (null);
    const { points, addPoints, deductPoints, setPoints } = usePoints(0); // Reset points on lesson load
    const [lessonQueue, setLessonQueue] = useState < LessonItem[] > ([]);
    const [currentItem, setCurrentItem] = useState < LessonItem | null > (null);
    const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
    const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState < boolean | null > (null);
    const [completedItemsMap, setCompletedItemsMap] = useState < Map < number, boolean >> (new Map());
    const [totalLessonItems, setTotalLessonItems] = useState(0);
    const [itemsCompletedCount, setItemsCompletedCount] = useState(0);

    // Load lesson data based on lessonId
    useEffect(() => {
        const loadedLesson = getLessonById(lessonId);
        if (!loadedLesson) {
            notFound(); // Show 404 if lesson not found
        } else {
            setLesson(loadedLesson);
            const initialItems = [...loadedLesson.items]; // Create mutable copy
            setLessonQueue(initialItems);
            setCurrentItem(initialItems[0] || null);
            setTotalLessonItems(initialItems.length);
            // Reset state for the new lesson
            setPoints(0);
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
            setCompletedItemsMap(new Map());
            setItemsCompletedCount(0);
        }
    }, [lessonId, setPoints]); // Depend on lessonId and setPoints from usePoints


    // Callback from Question components when *an attempt* is submitted
    const handleAnswerSubmit = useCallback((isCorrect: boolean) => {
        if (!currentItem || currentItem.type === 'informationalSnippet') return;

        const itemId = currentItem.id;

        if (isCorrect) {
            // Award points only if this item hasn't been marked as fully completed yet
            if (!completedItemsMap.has(itemId)) {
                addPoints(currentItem.pointsAwarded);
                setItemsCompletedCount(prev => prev + 1); // Increment completion count
                setCompletedItemsMap(prevMap => new Map(prevMap).set(itemId, true)); // Mark as completed
            }
            setLastAnswerCorrectness(true);
        } else {
            // Deduct points only if it's a question type and hasn't been completed yet
            if (!completedItemsMap.has(itemId) && 'pointsForIncorrect' in currentItem) {
                deductPoints(currentItem.pointsForIncorrect);
            }
            setLastAnswerCorrectness(false);
        }
        setIsCurrentAttemptSubmitted(true); // Mark the attempt as submitted
    }, [currentItem, addPoints, deductPoints, completedItemsMap]);


    // Callback when the "Next" button (or final submit) is clicked for *any* item type
    // Define handleNextItem before handleSnippetAcknowledged
    const handleNextItem = useCallback(() => {
        // Ensure an item exists and an answer/acknowledgement has been made for it
        // For snippets, lastAnswerCorrectness is set to true by handleSnippetAcknowledged before this is called.
        // For questions, lastAnswerCorrectness is set by handleAnswerSubmit.
        if (!currentItem || (currentItem.type !== 'informationalSnippet' && lastAnswerCorrectness === null) ) return;


        const wasCorrectOrAcknowledged = lastAnswerCorrectness; // For questions, this is correctness. For snippets, it's true.
        const itemJustProcessed = currentItem;

        let nextQueue = lessonQueue.slice(1); // Get remaining items

        // If it was a question type, it was incorrect, AND this item hasn't been marked as fully completed before,
        // move it to the end of the queue. Snippets are never moved back as they are considered 'acknowledged'.
        if (itemJustProcessed.type !== 'informationalSnippet' && !wasCorrectOrAcknowledged && !completedItemsMap.has(itemJustProcessed.id)) {
            nextQueue.push(itemJustProcessed); // Add the incorrect item to the end
        }

        setLessonQueue(nextQueue); // Update the queue state

        // Set the next item, or null if the queue is empty
        setCurrentItem(nextQueue[0] || null);
        // Reset for the next item (isCurrentAttemptSubmitted, lastAnswerCorrectness)
        // is handled by the useEffect watching currentItem

    }, [currentItem, lastAnswerCorrectness, lessonQueue, completedItemsMap]);


    // Callback specifically for Informational Snippets when 'Next' is clicked
    const handleSnippetAcknowledged = useCallback(() => {
        if (!currentItem || currentItem.type !== 'informationalSnippet') return;

        const itemId = currentItem.id;
        // Award points only if this item hasn't been marked as fully completed yet
        if (!completedItemsMap.has(itemId)) {
            addPoints(currentItem.pointsAwarded);
            setItemsCompletedCount(prev => prev + 1); // Increment completion count
            setCompletedItemsMap(prevMap => new Map(prevMap).set(itemId, true)); // Mark as completed
        }
        // Snippets are always considered "correct" for progression once acknowledged
        setLastAnswerCorrectness(true);
        setIsCurrentAttemptSubmitted(true); // Mark as submitted to enable 'Next' logic

        // Directly trigger moving to the next item after acknowledging
        handleNextItem();

    }, [currentItem, addPoints, completedItemsMap, handleNextItem]);


    // Reset attempt state when the current item changes within the same lesson
    useEffect(() => {
        if (currentItem) { // Only reset if there's a current item
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
        }
    }, [currentItem]);


    // Derived states for completion
    const allUniqueItemsCompleted = totalLessonItems > 0 && completedItemsMap.size === totalLessonItems;
    // Check if the current item is the last one *in the current queue* AND it has been completed (correct/acknowledged)
    const isFinalCompletedItemInQueue = currentItem !== null && lessonQueue.length === 1 && completedItemsMap.has(currentItem.id);
    // Lesson is complete when all unique items have been completed and there's no current item displayed (queue is empty)
    const isLessonComplete = allUniqueItemsCompleted && currentItem === null;


    const renderLessonItemComponent = () => {
        if (!currentItem) return null;

        // Extract key and common props carefully
        const commonPropsBase = {
            id: currentItem.id,
            title: currentItem.title,
            pointsAwarded: currentItem.pointsAwarded,
            isAnswerSubmitted: isCurrentAttemptSubmitted,
            // isLastItem signifies if the current item is the last in the lesson queue *and* it's been completed.
            // This is used by child components to change button text to "Lesson Complete".
            isLastItem: isFinalCompletedItemInQueue,
            onNext: handleNextItem, // Universal 'Next' handler
        };

        // Remove 'id' for spreading, pass 'key' separately
        const { id: key, ...restCommonProps } = commonPropsBase;

        switch (currentItem.type) {
            case 'freeResponse':
                return (
                    <FreeResponseQuestion
                        key={key} // Pass key directly
                        {...restCommonProps} // Spread the rest
                        question={currentItem.question}
                        expectedAnswer={currentItem.expectedAnswer}
                        pointsForIncorrect={currentItem.pointsForIncorrect}
                        onAnswerSubmit={handleAnswerSubmit}
                        // Map props specifically needed by the component
                        pointsForCorrect={currentItem.pointsAwarded}
                        isLastQuestion={isFinalCompletedItemInQueue} // Prop name specific to component
                        onNextQuestion={handleNextItem} // Prop name specific to component
                    />
                );
            case 'multipleChoice':
                return (
                    <MultipleChoiceQuestion
                        key={key} // Pass key directly
                        {...restCommonProps} // Spread the rest
                        question={currentItem.question}
                        options={currentItem.options}
                        correctOptionIndex={currentItem.correctOptionIndex}
                        pointsForIncorrect={currentItem.pointsForIncorrect}
                        onAnswerSubmit={handleAnswerSubmit}
                        // Map props specifically needed by the component
                        pointsForCorrect={currentItem.pointsAwarded}
                        isLastQuestion={isFinalCompletedItemInQueue} // Prop name specific to component
                        onNextQuestion={handleNextItem} // Prop name specific to component
                    />
                );
            case 'informationalSnippet':
                return (
                    <InformationalSnippet
                        key={key} // Pass key directly
                        {...restCommonProps} // Spread the rest
                        content={currentItem.content}
                        onAcknowledged={handleSnippetAcknowledged} // Snippets have specific acknowledgement logic
                        // Map props specifically needed by the component
                        isLastSnippet={isFinalCompletedItemInQueue} // Prop name specific to component
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
                        pointsForCorrect={currentItem.pointsAwarded}
                        isLastTask={isFinalCompletedItemInQueue} // Prop name specific to component
                        onNextTask={handleNextItem} // Prop name specific to component
                    />
                );
            default:
                // Handle potential future types or errors with exhaustive check simulation
                const _exhaustiveCheck: never = currentItem;
                console.error("Unknown lesson item type:", _exhaustiveCheck);
                return <div> Error: Unknown lesson item type. </div>;
        }
    };


    const getCurrentItemIcon = () => {
        if (!currentItem) return null;
        switch (currentItem.type) {
            case 'freeResponse':
                return <PencilRuler className="h-5 w-5 text-muted-foreground" />;
            case 'multipleChoice':
                return <ListChecks className="h-5 w-5 text-muted-foreground" />;
            case 'informationalSnippet':
                return <Info className="h-5 w-5 text-muted-foreground" />;
            case 'promptingTask':
                return <FilePenLine className="h-5 w-5 text-muted-foreground" />;
            default:
                return <BookOpen className="h-5 w-5 text-muted-foreground" />; // Default icon
        }
    }

    const progressPercentage = totalLessonItems > 0 ? (itemsCompletedCount / totalLessonItems) * 100 : 0;


    if (!lesson) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Lesson...</p>
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
                        {totalLessonItems === 0 ? "This lesson has no content yet." : "Loading lesson content..."}
                    </div>
                )}
            </div>
        </main>
    );
}
