
"use client";

import type React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, HomeIcon } from 'lucide-react';
import { useGlobalPoints } from '@/context/PointsContext'; // Import the hook

interface LessonCompleteScreenProps {
  points: number; // Points earned in *this* lesson
  lessonTitle: string;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ points, lessonTitle }) => {
  const { addTotalPoints } = useGlobalPoints();

  // Add the points earned in this lesson to the global total when the screen mounts
  useEffect(() => {
    // We only add points once when the component mounts.
    // This assumes the component only mounts upon successful lesson completion.
    // Check if points > 0 to avoid adding 0 points unnecessarily.
    if (points > 0) {
       addTotalPoints(points);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg text-center border-green-500 bg-green-50">
      <CardHeader className="items-center">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
        <CardTitle className="text-2xl font-bold text-green-800">Lesson Complete!</CardTitle>
         <CardDescription className="text-green-700">
           You finished the "{lessonTitle}" lesson.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-green-700">
          Congratulations! You've successfully navigated all the items.
        </p>
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <p className="text-xl font-semibold text-foreground">
            Points earned this lesson: <span className="font-bold text-primary">{points}</span>
          </p>
        </div>
         <p className="text-sm text-muted-foreground">
             These points have been added to your total score.
         </p>
      </CardContent>
       <CardFooter className="flex justify-center pt-6">
           <Link href="/" passHref legacyBehavior>
                <Button variant="default">
                   <HomeIcon className="mr-2 h-4 w-4" /> Back to Lessons
                </Button>
           </Link>
       </CardFooter>
    </Card>
  );
};
