
"use client";

import type React from 'react'; // Import type React
import { useState, useEffect, useCallback } from 'react';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion'; // Import the new component
import { PromptEvaluator } from '@/components/PromptEvaluator';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoints } from '@/hooks/usePoints';
import { BrainCircuit, PencilRuler, CheckCircle, ListChecks } from 'lucide-react'; // Added ListChecks

// Define the structure for a lesson, accommodating both types
interface BaseLesson {
  id: number;
  title: string;
  question: string;
  pointsForCorrect: number;
  pointsForIncorrect: number;
}

interface FreeResponseLesson extends BaseLesson {
  type: 'freeResponse';
  expectedAnswer: string;
}

interface MultipleChoiceLesson extends BaseLesson {
  type: 'multipleChoice';
  options: string[];
  correctOptionIndex: number;
}

type Lesson = FreeResponseLesson | MultipleChoiceLesson;

// Example array of lessons - include both types
const initialLessons: Lesson[] = [
  {
    id: 1,
    type: 'freeResponse',
    title: "Introduction to Prompt Engineering",
    question: "Explain in your own words what 'prompt engineering' means in the context of large language models.",
    expectedAnswer: "Prompt engineering involves designing and refining input prompts to guide large language models (LLMs) like ChatGPT towards generating desired, accurate, and relevant outputs. It focuses on clarity, context, and specific instructions.",
    pointsForCorrect: 10,
    pointsForIncorrect: 2,
  },
  {
    id: 2,
    type: 'multipleChoice',
    title: "Identifying Prompt Components",
    question: "Which of the following is NOT typically considered a core component of an effective prompt?",
    options: ["Clear Instruction", "Context", "Desired Output Format", "Random Keywords"],
    correctOptionIndex: 3, // "Random Keywords" is the incorrect component
    pointsForCorrect: 8,
    pointsForIncorrect: 1,
  },
  {
    id: 3,
    type: 'freeResponse',
    title: "Key Elements of a Good Prompt",
    question: "What are three essential components you should consider including in a prompt to make it more effective?",
    expectedAnswer: "Effective prompts often include: 1. Clear Instruction/Task: What should the LLM do? 2. Context: Relevant background information. 3. Role/Persona (Optional but helpful): Define how the LLM should act (e.g., 'Act as a historian'). Other valid elements include constraints, output format, examples (few-shot).",
    pointsForCorrect: 15,
    pointsForIncorrect: 3,
  },
   {
    id: 4,
    type: 'multipleChoice',
    title: "Prompting Techniques",
    question: "Providing examples within the prompt to guide the model is known as:",
    options: ["Zero-shot prompting", "Meta-prompting", "Few-shot prompting", "Instructional prompting"],
    correctOptionIndex: 2, // "Few-shot prompting"
    pointsForCorrect: 10,
    pointsForIncorrect: 2,
  },
  {
    id: 5,
    type: 'freeResponse',
    title: "Zero-Shot vs. Few-Shot Prompting",
    question: "Briefly describe the difference between zero-shot and few-shot prompting.",
    expectedAnswer: "Zero-shot prompting provides an instruction without any examples of the desired output. Few-shot prompting includes one or more examples (input/output pairs) within the prompt itself to guide the model on the expected format or style.",
    pointsForCorrect: 12,
    pointsForIncorrect: 2,
  },
];

export default function Home() {
  const { points, addPoints, deductPoints } = usePoints(0);
  const [questionsToAsk, setQuestionsToAsk] = useState<Lesson[]>([...initialLessons]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
  const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
  const [answeredCorrectlyMap, setAnsweredCorrectlyMap] = useState<Map<number, boolean>>(new Map());
  const [totalInitialQuestions, setTotalInitialQuestions] = useState(initialLessons.length);
  const [questionsCompletedCount, setQuestionsCompletedCount] = useState(0);


  // Initialize first question
  useEffect(() => {
    if (questionsToAsk.length > 0 && !currentLesson) {
      setCurrentLesson(questionsToAsk[0]);
      setTotalInitialQuestions(initialLessons.length);
    }
     // Reset attempt state when the current lesson changes
     setIsCurrentAttemptSubmitted(false);
     setLastAnswerCorrectness(null);
  }, [questionsToAsk, currentLesson]);

  // Callback from Question components when *an attempt* is submitted
  const handleAnswerSubmit = useCallback((isCorrect: boolean) => {
    if (!currentLesson) return;

    const lessonId = currentLesson.id;

    if (isCorrect) {
      if (!answeredCorrectlyMap.has(lessonId)) {
        addPoints(currentLesson.pointsForCorrect);
        setQuestionsCompletedCount(prev => prev + 1);
        setAnsweredCorrectlyMap(prevMap => new Map(prevMap).set(lessonId, true));
      }
      setLastAnswerCorrectness(true);
    } else {
      if (!answeredCorrectlyMap.has(lessonId)) {
        deductPoints(currentLesson.pointsForIncorrect);
      }
      setLastAnswerCorrectness(false);
    }
    setIsCurrentAttemptSubmitted(true);
  }, [currentLesson, addPoints, deductPoints, answeredCorrectlyMap]);

  // Callback when the "Next" button (or final submit) is clicked
  const handleNextQuestion = useCallback(() => {
    if (!currentLesson || lastAnswerCorrectness === null) return;

    const wasCorrect = lastAnswerCorrectness;
    const lessonJustAnswered = currentLesson;

    let nextQuestions = questionsToAsk.slice(1);

    // If the answer was incorrect AND this question hasn't been marked as correctly answered before,
    // move it to the end of the queue.
    if (!wasCorrect && !answeredCorrectlyMap.has(lessonJustAnswered.id)) {
      nextQuestions.push(lessonJustAnswered);
    }

    setQuestionsToAsk(nextQuestions);

    // Set the next question, or null if the queue is empty
    if (nextQuestions.length > 0) {
        setCurrentLesson(nextQuestions[0]);
        setIsCurrentAttemptSubmitted(false); // Reset for the new question
        setLastAnswerCorrectness(null);    // Reset for the new question
    } else {
        setCurrentLesson(null); // No more questions
        setIsCurrentAttemptSubmitted(false);
        setLastAnswerCorrectness(null);
    }
  }, [currentLesson, lastAnswerCorrectness, questionsToAsk, answeredCorrectlyMap]);


  const allUniqueQuestionsAnswered = answeredCorrectlyMap.size === totalInitialQuestions;
  // Check if the current question is the last one *in the current queue* AND it has been answered correctly
  const isFinalCorrectlyAnsweredQuestion = currentLesson !== null && questionsToAsk.length === 1 && answeredCorrectlyMap.has(currentLesson.id);
  // Lesson is complete when all unique questions have been answered correctly and there's no current question displayed
  const isLessonComplete = allUniqueQuestionsAnswered && currentLesson === null;


  const renderQuestionComponent = () => {
    if (!currentLesson) return null; // Should be handled by isLessonComplete check, but safety first

    // Extract key from commonProps to pass it directly
    const { id: key, ...restCommonProps } = {
        id: currentLesson.id, // Use lesson ID as key
        question: currentLesson.question,
        pointsForCorrect: currentLesson.pointsForCorrect,
        pointsForIncorrect: currentLesson.pointsForIncorrect,
        onAnswerSubmit: handleAnswerSubmit,
        isAnswerSubmitted: isCurrentAttemptSubmitted,
        // isLastQuestion now signifies the very final step after all unique questions are correct
        isLastQuestion: isFinalCorrectlyAnsweredQuestion,
        onNextQuestion: handleNextQuestion,
    };

    switch (currentLesson.type) {
      case 'freeResponse':
        return (
          <FreeResponseQuestion
            key={key} // Pass key directly
            {...restCommonProps} // Spread the rest of the props
            expectedAnswer={currentLesson.expectedAnswer}
          />
        );
      case 'multipleChoice':
        return (
           <MultipleChoiceQuestion
            key={key} // Pass key directly
            {...restCommonProps} // Spread the rest of the props
            options={currentLesson.options}
            correctOptionIndex={currentLesson.correctOptionIndex}
          />
        );
      default:
         // Handle potential future types or errors
        console.error("Unknown lesson type:", currentLesson);
        return <div>Error: Unknown question type.</div>;
    }
  };


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
            Lesson Questions ({questionsCompletedCount}/{totalInitialQuestions})
          </TabsTrigger>
          <TabsTrigger value="evaluator">
            <PencilRuler className="mr-2 h-4 w-4" /> Prompt Evaluator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
          {isLessonComplete ? (
            <LessonCompleteScreen points={points} />
          ) : currentLesson ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-semibold">{currentLesson.title}</h2>
                 {currentLesson.type === 'multipleChoice' && <ListChecks className="h-5 w-5 text-muted-foreground" />}
                 {currentLesson.type === 'freeResponse' && <PencilRuler className="h-5 w-5 text-muted-foreground" />}
              </div>
              {renderQuestionComponent()}
            </div>
          ) : (
             <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
               Loading questions...
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
