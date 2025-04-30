
"use client";

import { useState } from 'react';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { PromptEvaluator } from '@/components/PromptEvaluator';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed Button import as it's no longer used directly here for "Next"
import { usePoints } from '@/hooks/usePoints';
import { BrainCircuit, PencilRuler, CheckCircle } from 'lucide-react'; // Removed ArrowRight icon

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
const lessons: Lesson[] = [
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false);

  const currentLesson = lessons[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lessons.length - 1;

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addPoints(currentLesson.pointsForCorrect);
    } else {
      // Only deduct if points > 0 or handle negative points if desired
      deductPoints(currentLesson.pointsForIncorrect);
    }
    setIsCurrentQuestionAnswered(true); // Mark current question as answered
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setIsCurrentQuestionAnswered(false); // Reset answered status for the new question
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
          <TabsTrigger value="lesson">
            <BrainCircuit className="mr-2 h-4 w-4" /> Lesson Questions ({currentQuestionIndex + 1}/{lessons.length})
          </TabsTrigger>
          <TabsTrigger value="evaluator">
            <PencilRuler className="mr-2 h-4 w-4" /> Prompt Evaluator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
          {currentQuestionIndex < lessons.length ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">{currentLesson.title}</h2>
              <FreeResponseQuestion
                key={currentLesson.id} // Use key to force re-render and reset state
                question={currentLesson.question}
                expectedAnswer={currentLesson.expectedAnswer}
                pointsForCorrect={currentLesson.pointsForCorrect}
                pointsForIncorrect={currentLesson.pointsForIncorrect}
                onAnswerSubmit={handleAnswerSubmit}
                isAnswerSubmitted={isCurrentQuestionAnswered} // Pass answered status
                isLastQuestion={isLastQuestion} // Pass last question status
                onNextQuestion={handleNextQuestion} // Pass next question handler
              />
              {/* Removed the separate Next Question button */}
              {isCurrentQuestionAnswered && isLastQuestion && (
                <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200 text-green-700 text-center">
                  <CheckCircle className="inline-block mr-2 h-5 w-5" />
                  You have completed all the questions! Check out the Prompt Evaluator.
                </div>
              )}
            </div>
          ) : (
             // This state might be unreachable if FreeResponseQuestion handles the last question state internally
             <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200 text-green-700 text-center">
               <CheckCircle className="inline-block mr-2 h-5 w-5" />
               Congratulations! You've finished all the lesson questions.
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
