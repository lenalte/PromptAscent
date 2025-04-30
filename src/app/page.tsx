
"use client";

import type React from 'react'; // Import type React
import { useState, useEffect, useCallback } from 'react';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet } from '@/components/InformationalSnippet'; // Import the new component
import { PromptEvaluator } from '@/components/PromptEvaluator';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoints } from '@/hooks/usePoints';
import { BrainCircuit, PencilRuler, CheckCircle, ListChecks, Info, BookOpen } from 'lucide-react'; // Added Info, BookOpen

// Define the structure for a lesson item
interface BaseLessonItem {
  id: number;
  title: string;
  pointsAwarded: number; // Unified points concept
}

interface FreeResponseLesson extends BaseLessonItem {
  type: 'freeResponse';
  question: string;
  expectedAnswer: string;
  pointsForIncorrect: number; // Specific to questions where deduction applies
}

interface MultipleChoiceLesson extends BaseLessonItem {
  type: 'multipleChoice';
  question: string;
  options: string[];
  correctOptionIndex: number;
  pointsForIncorrect: number; // Specific to questions where deduction applies
}

interface InformationalSnippetLesson extends BaseLessonItem {
    type: 'informationalSnippet';
    content: string;
    // No pointsForIncorrect for snippets
}

// Union type for all lesson items
type LessonItem = FreeResponseLesson | MultipleChoiceLesson | InformationalSnippetLesson;

// Example array of lesson items - include all types
const initialLessonItems: LessonItem[] = [
   {
    id: 1,
    type: 'informationalSnippet',
    title: "Welcome to Prompt Engineering Basics!",
    content: "In this lesson, we'll explore the fundamentals of crafting effective prompts for large language models (LLMs). Understanding prompt engineering helps you get better, more predictable results from AI.",
    pointsAwarded: 2, // Points for viewing the intro
  },
  {
    id: 2,
    type: 'freeResponse',
    title: "Introduction to Prompt Engineering",
    question: "Explain in your own words what 'prompt engineering' means in the context of large language models.",
    expectedAnswer: "Prompt engineering involves designing and refining input prompts to guide large language models (LLMs) like ChatGPT towards generating desired, accurate, and relevant outputs. It focuses on clarity, context, and specific instructions.",
    pointsAwarded: 10, // Points for correct answer
    pointsForIncorrect: 2,
  },
  {
    id: 3,
    type: 'multipleChoice',
    title: "Identifying Prompt Components",
    question: "Which of the following is NOT typically considered a core component of an effective prompt?",
    options: ["Clear Instruction", "Context", "Desired Output Format", "Random Keywords"],
    correctOptionIndex: 3, // "Random Keywords" is the incorrect component
    pointsAwarded: 8, // Points for correct answer
    pointsForIncorrect: 1,
  },
   {
    id: 4,
    type: 'informationalSnippet',
    title: "Tip: Be Specific!",
    content: "Vague prompts lead to vague answers. The more specific your instructions, context, and desired output format, the better the LLM can understand and fulfill your request.",
    pointsAwarded: 3, // Points for viewing the tip
  },
  {
    id: 5,
    type: 'freeResponse',
    title: "Key Elements of a Good Prompt",
    question: "What are three essential components you should consider including in a prompt to make it more effective?",
    expectedAnswer: "Effective prompts often include: 1. Clear Instruction/Task: What should the LLM do? 2. Context: Relevant background information. 3. Role/Persona (Optional but helpful): Define how the LLM should act (e.g., 'Act as a historian'). Other valid elements include constraints, output format, examples (few-shot).",
    pointsAwarded: 15, // Points for correct answer
    pointsForIncorrect: 3,
  },
   {
    id: 6,
    type: 'multipleChoice',
    title: "Prompting Techniques",
    question: "Providing examples within the prompt to guide the model is known as:",
    options: ["Zero-shot prompting", "Meta-prompting", "Few-shot prompting", "Instructional prompting"],
    correctOptionIndex: 2, // "Few-shot prompting"
    pointsAwarded: 10, // Points for correct answer
    pointsForIncorrect: 2,
  },
   {
    id: 7,
    type: 'informationalSnippet',
    title: "Understanding 'Few-Shot' Prompting",
    content: "Few-shot prompting gives the LLM examples of what you want. For instance, if you want it to summarize text in bullet points, show it an example input text and its bulleted summary before giving it the text you actually want summarized.",
    pointsAwarded: 4, // Points for viewing this explanation
  },
  {
    id: 8,
    type: 'freeResponse',
    title: "Zero-Shot vs. Few-Shot Prompting",
    question: "Briefly describe the difference between zero-shot and few-shot prompting.",
    expectedAnswer: "Zero-shot prompting provides an instruction without any examples of the desired output. Few-shot prompting includes one or more examples (input/output pairs) within the prompt itself to guide the model on the expected format or style.",
    pointsAwarded: 12, // Points for correct answer
    pointsForIncorrect: 2,
  },
];

export default function Home() {
  const { points, addPoints, deductPoints } = usePoints(0);
  const [lessonQueue, setLessonQueue] = useState<LessonItem[]>([...initialLessonItems]);
  const [currentItem, setCurrentItem] = useState<LessonItem | null>(null);
  const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
  const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
  const [completedItemsMap, setCompletedItemsMap] = useState<Map<number, boolean>>(new Map()); // Tracks items fully completed (correct answer or snippet acknowledged)
  const [totalInitialItems, setTotalInitialItems] = useState(initialLessonItems.length);
  const [itemsCompletedCount, setItemsCompletedCount] = useState(0);


  // Initialize first item
  useEffect(() => {
    if (lessonQueue.length > 0 && !currentItem) {
      setCurrentItem(lessonQueue[0]);
      setTotalInitialItems(initialLessonItems.length);
    }
     // Reset attempt state when the current item changes
     setIsCurrentAttemptSubmitted(false);
     setLastAnswerCorrectness(null);
  }, [lessonQueue, currentItem]);

  // Callback from Question components when *an attempt* is submitted
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
      // Deduct points only if it's a question type and hasn't been completed yet
      if (!completedItemsMap.has(itemId) && 'pointsForIncorrect' in currentItem) {
          deductPoints(currentItem.pointsForIncorrect);
      }
      setLastAnswerCorrectness(false);
    }
    setIsCurrentAttemptSubmitted(true);
  }, [currentItem, addPoints, deductPoints, completedItemsMap]);

  // Callback specifically for Informational Snippets when 'Next' is clicked
  const handleSnippetAcknowledged = useCallback(() => {
    if (!currentItem || currentItem.type !== 'informationalSnippet') return;

    const itemId = currentItem.id;
    if (!completedItemsMap.has(itemId)) {
        addPoints(currentItem.pointsAwarded);
        setItemsCompletedCount(prev => prev + 1);
        setCompletedItemsMap(prevMap => new Map(prevMap).set(itemId, true));
    }
    // Snippets are always considered "correct" once acknowledged for moving forward
    setLastAnswerCorrectness(true);
    setIsCurrentAttemptSubmitted(true); // Mark as submitted to enable 'Next' logic

    // Directly trigger moving to the next item after acknowledging
    handleNextItem();

  }, [currentItem, addPoints, completedItemsMap]);


  // Callback when the "Next" button (or final submit) is clicked for *any* item type
  const handleNextItem = useCallback(() => {
    if (!currentItem || lastAnswerCorrectness === null) return;

    const wasCorrectOrAcknowledged = lastAnswerCorrectness; // True for correct answers or acknowledged snippets
    const itemJustProcessed = currentItem;

    let nextQueue = lessonQueue.slice(1);

    // If it was a question, it was incorrect, AND this item hasn't been marked as completed before,
    // move it to the end of the queue. Snippets are never moved back.
    if (itemJustProcessed.type !== 'informationalSnippet' && !wasCorrectOrAcknowledged && !completedItemsMap.has(itemJustProcessed.id)) {
      nextQueue.push(itemJustProcessed);
    }

    setLessonQueue(nextQueue);

    // Set the next item, or null if the queue is empty
    if (nextQueue.length > 0) {
        setCurrentItem(nextQueue[0]);
        setIsCurrentAttemptSubmitted(false); // Reset for the new item
        setLastAnswerCorrectness(null);    // Reset for the new item
    } else {
        setCurrentItem(null); // No more items
        setIsCurrentAttemptSubmitted(false);
        setLastAnswerCorrectness(null);
    }
  }, [currentItem, lastAnswerCorrectness, lessonQueue, completedItemsMap]);


  const allUniqueItemsCompleted = completedItemsMap.size === totalInitialItems;
  // Check if the current item is the last one *in the current queue* AND it has been completed (correct/acknowledged)
  const isFinalCompletedItemInQueue = currentItem !== null && lessonQueue.length === 1 && completedItemsMap.has(currentItem.id);
  // Lesson is complete when all unique items have been completed and there's no current item displayed
  const isLessonComplete = allUniqueItemsCompleted && currentItem === null;


  const renderLessonItemComponent = () => {
    if (!currentItem) return null;

    // Extract key and common props
    const { id: key, ...restCommonProps } = {
        id: currentItem.id, // Use item ID as key
        title: currentItem.title,
        pointsAwarded: currentItem.pointsAwarded,
        isAnswerSubmitted: isCurrentAttemptSubmitted,
        // isLastItem now signifies the very final step after all unique items are completed
        isLastItem: isFinalCompletedItemInQueue,
        onNext: handleNextItem, // Universal 'Next' handler
    };

    switch (currentItem.type) {
      case 'freeResponse':
        return (
          <FreeResponseQuestion
            key={key}
            {...restCommonProps}
            question={currentItem.question}
            expectedAnswer={currentItem.expectedAnswer}
            pointsForIncorrect={currentItem.pointsForIncorrect}
            onAnswerSubmit={handleAnswerSubmit} // Specific submit handler for questions
            // Ensure props match FreeResponseQuestion component props
            pointsForCorrect={currentItem.pointsAwarded} // Map pointsAwarded to pointsForCorrect
            isLastQuestion={isFinalCompletedItemInQueue} // Map isLastItem to isLastQuestion
            onNextQuestion={handleNextItem} // Map onNext to onNextQuestion
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
            onAnswerSubmit={handleAnswerSubmit} // Specific submit handler for questions
             // Ensure props match MultipleChoiceQuestion component props
             pointsForCorrect={currentItem.pointsAwarded} // Map pointsAwarded to pointsForCorrect
             isLastQuestion={isFinalCompletedItemInQueue} // Map isLastItem to isLastQuestion
             onNextQuestion={handleNextItem} // Map onNext to onNextQuestion
          />
        );
      case 'informationalSnippet':
          return (
            <InformationalSnippet
              key={key}
              {...restCommonProps}
              content={currentItem.content}
              onAcknowledged={handleSnippetAcknowledged} // Specific handler for snippets
              // Map necessary props
              isLastSnippet={isFinalCompletedItemInQueue} // Map isLastItem
            />
          );
      default:
         // Handle potential future types or errors
        console.error("Unknown lesson item type:", currentItem);
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


  return (
    <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
      <div className="w-full max-w-4xl flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Prompt Ascent</h1>
        <PointsDisplay points={points} />
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="lesson" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="lesson" disabled={isLessonComplete}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Lesson ({itemsCompletedCount}/{totalInitialItems})
          </TabsTrigger>
          <TabsTrigger value="evaluator">
            <PencilRuler className="mr-2 h-4 w-4" /> Prompt Evaluator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
          {isLessonComplete ? (
            <LessonCompleteScreen points={points} />
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
               Loading lesson content...
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

