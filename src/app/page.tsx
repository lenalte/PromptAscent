
"use client";

import { useState, useEffect, useCallback } from 'react';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { PromptEvaluator } from '@/components/PromptEvaluator';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen'; // Import the new component
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoints } from '@/hooks/usePoints';
import { BrainCircuit, PencilRuler, CheckCircle } from 'lucide-react';

// Define the structure for a lesson
interface Lesson {
  id: number;
  title: string;
  question: string;
  expectedAnswer: string;
  pointsForCorrect: number;
  pointsForIncorrect: number;
}

// Example array of lessons - replace with actual lesson data
const initialLessons: Lesson[] = [
  {
    id: 1,
    title: "Introduction to Prompt Engineering",
    question: "Explain in your own words what 'prompt engineering' means in the context of large language models.",
    expectedAnswer: "Prompt engineering involves designing and refining input prompts to guide large language models (LLMs) like ChatGPT towards generating desired, accurate, and relevant outputs. It focuses on clarity, context, and specific instructions.",
    pointsForCorrect: 10,
    pointsForIncorrect: 2,
  },
  {
    id: 2,
    title: "Key Elements of a Good Prompt",
    question: "What are three essential components you should consider including in a prompt to make it more effective?",
    expectedAnswer: "Effective prompts often include: 1. Clear Instruction/Task: What should the LLM do? 2. Context: Relevant background information. 3. Role/Persona (Optional but helpful): Define how the LLM should act (e.g., 'Act as a historian'). Other valid elements include constraints, output format, examples (few-shot).",
    pointsForCorrect: 15,
    pointsForIncorrect: 3,
  },
  {
    id: 3,
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
  // State for the *current attempt* on the displayed question component
  const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
  const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
  // Tracks which unique questions (by ID) have been answered correctly at least once
  const [answeredCorrectlyMap, setAnsweredCorrectlyMap] = useState<Map<number, boolean>>(new Map());
  const [totalInitialQuestions, setTotalInitialQuestions] = useState(initialLessons.length);
  // Tracks the count of *unique* questions answered correctly
  const [questionsCompletedCount, setQuestionsCompletedCount] = useState(0);


  // Initialize first question
  useEffect(() => {
    if (questionsToAsk.length > 0 && !currentLesson) {
      setCurrentLesson(questionsToAsk[0]);
      setTotalInitialQuestions(initialLessons.length); // Store the initial total count
    }
     // Reset attempt state when the current lesson changes
     setIsCurrentAttemptSubmitted(false);
     setLastAnswerCorrectness(null);
  }, [questionsToAsk, currentLesson]); // Depend only on these

  // Callback from FreeResponseQuestion when *an attempt* is submitted
  const handleAnswerSubmit = useCallback((isCorrect: boolean) => {
    if (!currentLesson) return;

    const lessonId = currentLesson.id;

    if (isCorrect) {
      // Only add points and update completion count if it's the *first time* this question is answered correctly
      if (!answeredCorrectlyMap.has(lessonId)) {
        addPoints(currentLesson.pointsForCorrect);
        setQuestionsCompletedCount(prev => prev + 1);
        setAnsweredCorrectlyMap(prevMap => new Map(prevMap).set(lessonId, true));
      }
      // If answered correctly again (after being wrong previously), still mark as correct for next step
      setLastAnswerCorrectness(true);
    } else {
      // Only deduct points if it hasn't been answered correctly before
      if (!answeredCorrectlyMap.has(lessonId)) {
        deductPoints(currentLesson.pointsForIncorrect);
      }
      setLastAnswerCorrectness(false);
    }
    setIsCurrentAttemptSubmitted(true); // Mark the current attempt as submitted
  }, [currentLesson, addPoints, deductPoints, answeredCorrectlyMap]);

  // Callback from FreeResponseQuestion when the "Next" button (or final submit) is clicked
  const handleNextQuestion = useCallback(() => {
    if (!currentLesson || lastAnswerCorrectness === null) return;

    const wasCorrect = lastAnswerCorrectness;
    const lessonJustAnswered = currentLesson;

    // Remove the current question from the front
    let nextQuestions = questionsToAsk.slice(1);

    // If incorrect AND it hasn't been answered correctly before, add it back to the end
    if (!wasCorrect && !answeredCorrectlyMap.has(lessonJustAnswered.id)) {
      nextQuestions.push(lessonJustAnswered);
    }

    setQuestionsToAsk(nextQuestions);

    // Move to the next question or finish
    if (nextQuestions.length > 0) {
      setCurrentLesson(nextQuestions[0]);
      // State reset is now handled by the useEffect watching currentLesson
    } else {
      setCurrentLesson(null); // No more questions
       // Explicitly reset attempt state when finishing
      setIsCurrentAttemptSubmitted(false);
      setLastAnswerCorrectness(null);
    }
  }, [currentLesson, lastAnswerCorrectness, questionsToAsk, answeredCorrectlyMap]);

  // Determines if all *unique* questions have been answered correctly
  const allUniqueQuestionsAnswered = answeredCorrectlyMap.size === totalInitialQuestions;
  // Determines if the currently displayed question is the last one in the queue *and* it has already been answered correctly
  // This signals to the button to show "Lesson Complete" and disable.
  const isFinalCorrectlyAnsweredQuestion = currentLesson !== null && questionsToAsk.length === 1 && answeredCorrectlyMap.has(currentLesson.id);

  const isLessonComplete = allUniqueQuestionsAnswered && currentLesson === null;


  return (
    <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
      <div className="w-full max-w-4xl flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Prompt Ascent</h1>
        <PointsDisplay points={points} />
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="lesson" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="lesson" disabled={isLessonComplete}> {/* Disable tab when lesson complete */}
            <BrainCircuit className="mr-2 h-4 w-4" />
            Lesson Questions ({questionsCompletedCount}/{totalInitialQuestions})
          </TabsTrigger>
          <TabsTrigger value="evaluator">
            <PencilRuler className="mr-2 h-4 w-4" /> Prompt Evaluator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
          {isLessonComplete ? (
            <LessonCompleteScreen points={points} /> // Show completion screen
          ) : currentLesson ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">{currentLesson.title}</h2>
              <FreeResponseQuestion
                key={currentLesson.id} // Use key to force re-render and reset internal state when question changes
                question={currentLesson.question}
                expectedAnswer={currentLesson.expectedAnswer}
                pointsForCorrect={currentLesson.pointsForCorrect}
                pointsForIncorrect={currentLesson.pointsForIncorrect}
                onAnswerSubmit={handleAnswerSubmit}
                isAnswerSubmitted={isCurrentAttemptSubmitted} // Pass the submission status of the current attempt
                isLastQuestion={isFinalCorrectlyAnsweredQuestion} // Pass whether this is the final, correctly answered question
                onNextQuestion={handleNextQuestion} // Pass next question handler
              />
            </div>
          ) : (
             <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
               {/* Optional: Loading state or initial message */}
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
