
"use client";

import type React from 'react';
import { useEffect, useState } from 'react'; // Added useState
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, HomeIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import { useRouter } from 'next/navigation'; // Corrected import

interface LessonCompleteScreenProps {
  points: number; // Points earned in *this* lesson
  lessonTitle: string;
  lessonId: string; // Current lesson ID to mark as complete
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ points, lessonTitle, lessonId }) => {
  const { completeLessonAndProceed, isLoadingProgress: isContextLoading } = useUserProgress();
  const router = useRouter();
  const [actualNextLessonId, setActualNextLessonId] = useState<string | null>(null);
  const [isProcessingCompletion, setIsProcessingCompletion] = useState(true);

  useEffect(() => {
    const markLessonCompleteAndGetNext = async () => {
      if (!lessonId || points < 0) {
        console.warn("[LessonCompleteScreen] Invalid lessonId or points, cannot process completion.");
        setIsProcessingCompletion(false);
        return;
      }

      setIsProcessingCompletion(true);
      try {
        console.log(`[LessonCompleteScreen] Marking lesson ${lessonId} as complete, points earned: ${points}`);
        const nextId = await completeLessonAndProceed(lessonId, points);
        setActualNextLessonId(nextId); // Store the direct result
        console.log(`[LessonCompleteScreen] Next lesson ID determined: ${nextId}`);
      } catch (error) {
        console.error("[LessonCompleteScreen] Error during lesson completion process:", error);
        // Optionally set actualNextLessonId to a specific state or show a toast
      } finally {
        setIsProcessingCompletion(false);
      }
    };

    markLessonCompleteAndGetNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, points]); // completeLessonAndProceed is memoized in context

  const handleProceed = () => {
      if (isProcessingCompletion || isContextLoading) return;

      if (actualNextLessonId) {
        router.push(`/lesson/${actualNextLessonId}`);
      } else {
        // If no next lesson ID (e.g., it's the last lesson, or an error occurred setting it)
        console.log("[LessonCompleteScreen] No specific next lesson ID, navigating to home.");
        router.push('/');
      }
  };

  const getButtonText = () => {
    if (isProcessingCompletion || isContextLoading) return "Saving...";
    return actualNextLessonId ? "Next Lesson" : "Back to Lessons Hub";
  }

  const getButtonIcon = () => {
    if (isProcessingCompletion || isContextLoading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    return actualNextLessonId ? <ArrowRight className="ml-2 h-4 w-4" /> : <HomeIcon className="mr-2 h-4 w-4" />;
  }


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
             Your total score and progress have been updated.
         </p>
      </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
           <Link href="/" passHref legacyBehavior>
                <Button variant="outline">
                   <HomeIcon className="mr-2 h-4 w-4" /> Back to Lessons Hub
                </Button>
           </Link>
           {/* This button will now either go to next lesson or back home if no next lesson */}
           <Button onClick={handleProceed} disabled={isProcessingCompletion || isContextLoading}>
                {getButtonIcon()}
                {getButtonText()}
           </Button>
       </CardFooter>
    </Card>
  );
};

