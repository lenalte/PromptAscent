
"use client"; // Add this directive as hooks are used

import { useState } from 'react';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { PromptEvaluator } from '@/components/PromptEvaluator';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoints } from '@/hooks/usePoints';
import { BrainCircuit, PencilRuler } from 'lucide-react'; // Import icons

export default function Home() {
  // Example lesson data - replace with actual lesson structure
  const lesson = {
    id: 1,
    title: "Introduction to Prompt Engineering",
    question: "Explain in your own words what 'prompt engineering' means in the context of large language models.",
    expectedAnswer: "Prompt engineering involves designing and refining input prompts to guide large language models (LLMs) like ChatGPT towards generating desired, accurate, and relevant outputs. It focuses on clarity, context, and specific instructions.",
    pointsForCorrect: 10,
    pointsForIncorrect: 2,
  };

  const { points, addPoints, deductPoints } = usePoints(0);

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addPoints(lesson.pointsForCorrect);
    } else {
      deductPoints(lesson.pointsForIncorrect);
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
             <BrainCircuit className="mr-2 h-4 w-4" /> Lesson Question
          </TabsTrigger>
          <TabsTrigger value="evaluator">
             <PencilRuler className="mr-2 h-4 w-4" /> Prompt Evaluator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lesson">
           <div className="space-y-6">
              <h2 className="text-2xl font-semibold">{lesson.title}</h2>
              <FreeResponseQuestion
                question={lesson.question}
                expectedAnswer={lesson.expectedAnswer} // Pass the expected answer
                pointsForCorrect={lesson.pointsForCorrect}
                pointsForIncorrect={lesson.pointsForIncorrect}
                onAnswerSubmit={handleAnswerSubmit}
              />
           </div>
        </TabsContent>
        <TabsContent value="evaluator">
          <PromptEvaluator />
        </TabsContent>
      </Tabs>

      {/* Placeholder for future lesson navigation or progress */}
      {/* <div className="w-full max-w-4xl mt-8">
        <h3 className="text-xl font-semibold mb-4">Lesson Progress</h3>
        {/* Add progress indicators or next lesson button here */}
      {/* </div> */}
    </main>
  );
}
