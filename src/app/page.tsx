
"use client";

import type React from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons'; // Import lesson data
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Separator } from '@/components/ui/separator';
import { useGlobalPoints } from '@/context/PointsContext'; // Import the global points hook

export default function Home() {
  const { totalPoints } = useGlobalPoints(); // Get total points from global context

  return (
    <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
      <div className="w-full max-w-4xl flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center">
           <BookOpen className="mr-3 h-8 w-8" /> Prompt Ascent
        </h1>
         <PointsDisplay points={totalPoints} /> {/* Display global total points */}
      </div>

       <Separator className="my-6 w-full max-w-4xl" />

       <div className="w-full max-w-4xl text-center mb-8">
         <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
         <p className="text-muted-foreground">
           Choose a lesson below to start learning and practicing prompt engineering. Your total score is shown above.
         </p>
       </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
                <Link href={`/lesson/${lesson.id}`} passHref legacyBehavior>
                    <Button variant="default">
                        Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
