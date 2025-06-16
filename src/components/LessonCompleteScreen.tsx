
"use client";

import type React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, HomeIcon, ArrowRight } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import { useRouter } from 'next/navigation';

interface LessonCompleteScreenProps {
  points: number; // Points earned in *this* lesson
  lessonTitle: string;
  lessonId: string; // Current lesson ID to mark as complete
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ points, lessonTitle, lessonId }) => {
  const { completeLessonAndProceed, userProgress, isLoadingProgress } = useUserProgress();
  const router = useRouter();

  useEffect(() => {
    // This effect now primarily serves to automatically mark the lesson as complete
    // and get the next lesson ID. The actual point addition is handled by completeLessonAndProceed.
    const markLessonComplete = async () => {
      if (lessonId && points >= 0) { // points can be 0
        // We don't need to call addPointsToTotal separately if completeLessonAndProceed handles it.
        // The `points` prop here is the points earned *in this lesson instance*.
        // `completeLessonAndProceed` will use this to update the total.
        console.log(`[LessonCompleteScreen] Marking lesson ${lessonId} as complete, points earned: ${points}`);
        // No need to await here if we navigate immediately, or handle loading state
        completeLessonAndProceed(lessonId, points);
      }
    };

    markLessonComplete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, points]); // completeLessonAndProceed is stable due to useCallback

  const handleProceedToNextLesson = async () => {
      if (isLoadingProgress) return;
      // completeLessonAndProceed might have already been called by useEffect
      // We might want to ensure it's called if not, or just rely on its result for nextLessonId
      const nextLessonId = userProgress?.currentLessonId; // This should be the *new* current lesson after completion

      if (nextLessonId && nextLessonId !== lessonId) {
        router.push(`/lesson/${nextLessonId}`);
      } else {
        // If no next lesson, or if currentLessonId hasn't updated yet, go home
        router.push('/');
      }
  };

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
             Your total score has been updated.
         </p>
      </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
           <Link href="/" passHref legacyBehavior>
                <Button variant="outline">
                   <HomeIcon className="mr-2 h-4 w-4" /> Back to Lessons Hub
                </Button>
           </Link>
           <Button onClick={handleProceedToNextLesson} disabled={isLoadingProgress}>
                {isLoadingProgress ? "Saving..." : "Next Lesson"}
                {!isLoadingProgress && <ArrowRight className="ml-2 h-4 w-4" />}
           </Button>
       </CardFooter>
    </Card>
  );
};
