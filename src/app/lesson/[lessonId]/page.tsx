
"use client";

import type React from 'react'; // Import type React
import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation'; // Import hooks
import Link from 'next/link';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet } from '@/components/InformationalSnippet';
import { PromptEvaluator } from '@/components/PromptEvaluator';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { usePoints } from '@/hooks/usePoints';
import { getLessonById, type Lesson, type LessonItem } from '@/data/lessons'; // Import lesson data and types
import { BrainCircuit, PencilRuler, CheckCircle, ListChecks, Info, BookOpen, HomeIcon, Loader2 } from 'lucide-react'; // Added Loader2

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string; // Get lessonId from URL

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const { points, addPoints, deductPoints, setPoints } = usePoints(0); // Reset points on lesson load
  const [lessonQueue, setLessonQueue] = useState<LessonItem[]>([]);
  const [currentItem, setCurrentItem] = useState<LessonItem | null>(null);
  const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
  const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
  const [completedItemsMap, setCompletedItemsMap] = useState<Map<number, boolean>>(new Map());
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

  // Reset attempt state when the current item changes within the same lesson
   useEffect(() => {
     if (currentItem) { // Only reset if there's a current item (avoids reset on initial load potentially)
        setIsCurrentAttemptSubmitted(false);
        setLastAnswerCorrectness(null);
     }
   }, [currentItem]);


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
        // Ensure an item exists and an answer/acknowledgement has been made
        if (!currentItem || lastAnswerCorrectness === null) return;

        const wasCorrectOrAcknowledged = lastAnswerCorrectness;
        const itemJustProcessed = currentItem;

        let nextQueue = lessonQueue.slice(1); // Get remaining items

        // If it was a question, it was incorrect, AND this item hasn't been marked as fully completed before,
        // move it to the end of the queue. Snippets are never moved back.
        if (itemJustProcessed.type !== 'informationalSnippet' && !wasCorrectOrAcknowledged && !completedItemsMap.has(itemJustProcessed.id)) {
            nextQueue.push(itemJustProcessed); // Add the incorrect item to the end
        }

        setLessonQueue(nextQueue); // Update the queue state

        // Set the next item, or null if the queue is empty
        setCurrentItem(nextQueue[0] || null);
        // Reset for the next item is handled by the useEffect watching currentItem

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
    // Snippets are always considered "correct" once acknowledged for moving forward
    setLastAnswerCorrectness(true);
    setIsCurrentAttemptSubmitted(true); // Mark as submitted to enable 'Next' logic

    // Directly trigger moving to the next item after acknowledging
     handleNextItem(); // Call handleNextItem directly

  }, [currentItem, addPoints, completedItemsMap, handleNextItem]); // handleNextItem is now defined above


  // Derived states for completion
  const allUniqueItemsCompleted = completedItemsMap.size === totalLessonItems && totalLessonItems > 0;
  // Check if the current item is the last one *in the current queue* AND it has been completed (correct/acknowledged)
  const isFinalCompletedItemInQueue = currentItem !== null && lessonQueue.length === 1 && completedItemsMap.has(currentItem.id);
  // Lesson is complete when all unique items have been completed and there's no current item displayed
  const isLessonComplete = allUniqueItemsCompleted && currentItem === null;


 const renderLessonItemComponent = () => {
    if (!currentItem) return null;

    // Extract key and common props carefully
    const commonPropsBase = {
        id: currentItem.id,
        title: currentItem.title,
        pointsAwarded: currentItem.pointsAwarded,
        isAnswerSubmitted: isCurrentAttemptSubmitted,
        // isLastItem signifies the very final step after all unique items are completed in the QUEUE
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
            isLastQuestion={isFinalCompletedItemInQueue}
            onNextQuestion={handleNextItem}
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
            isLastQuestion={isFinalCompletedItemInQueue}
            onNextQuestion={handleNextItem}
          />
        );
      case 'informationalSnippet':
          return (
            <InformationalSnippet
              key={key} // Pass key directly
              {...restCommonProps} // Spread the rest
              content={currentItem.content}
              onAcknowledged={handleSnippetAcknowledged}
              // Map props specifically needed by the component
              isLastSnippet={isFinalCompletedItemInQueue}
            />
          );
      default:
        // Handle potential future types or errors with exhaustive check simulation
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
          default: return <BookOpen className="h-5 w-5 text-muted-foreground"/>; // Default icon
      }
   }


   if (!lesson) {
       // Optional: Add a loading state here
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

      <Tabs defaultValue="lesson" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="lesson" disabled={isLessonComplete}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Lesson ({itemsCompletedCount}/{totalLessonItems})
          </TabsTrigger>
          <TabsTrigger value="evaluator">
            <PencilRuler className="mr-2 h-4 w-4" /> Prompt Evaluator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
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
             // This state might occur briefly between loading or if lesson has no items
             <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
               { totalLessonItems === 0 ? "This lesson has no content yet." : "Loading lesson content..."}
             </div>
          )}
        </TabsContent>
        <TabsContent value="evaluator">
          <PromptEvaluator />
        </TabsContent>
      </Tabs>
    </main>
  );
}

