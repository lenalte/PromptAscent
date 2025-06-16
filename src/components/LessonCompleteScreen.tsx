
"use client";

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, HomeIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import { useRouter } from 'next/navigation';

interface LessonCompleteScreenProps {
  points: number; // Points earned in *this* lesson
  lessonTitle: string;
  lessonId: string; // Current lesson ID to mark as complete
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ points, lessonTitle, lessonId }) => {
  const { completeLessonAndProceed, isLoadingProgress: isContextLoading, userProgress } = useUserProgress();
  const router = useRouter();
  const [actualNextLessonId, setActualNextLessonId] = useState<string | null>(null);
  const [isProcessingScreenLogic, setIsProcessingScreenLogic] = useState(true); // True initially to show loading
  const [hasAttemptedProcessing, setHasAttemptedProcessing] = useState(false);

  useEffect(() => {
    const markLessonCompleteAndGetNext = async () => {
      // Ensure this runs only once per screen load for a specific lesson
      if (hasAttemptedProcessing || !lessonId) {
        if (!hasAttemptedProcessing) setIsProcessingScreenLogic(false); // Stop loading if no lessonId or already processed
        return;
      }

      setHasAttemptedProcessing(true); // Mark that we are attempting the processing
      setIsProcessingScreenLogic(true); // Ensure loading state is active
      console.log(`[LessonCompleteScreen] useEffect running for lesson ${lessonId}. Attempting to mark complete.`);

      try {
        console.log(`[LessonCompleteScreen] Calling completeLessonAndProceed for lesson ${lessonId} with points ${points}`);
        const nextId = await completeLessonAndProceed(lessonId, points);
        console.log(`[LessonCompleteScreen] completeLessonAndProceed returned: "${nextId}". Setting actualNextLessonId.`);
        setActualNextLessonId(nextId); // Store the direct result
      } catch (error) {
        console.error("[LessonCompleteScreen] Error during lesson completion process:", error);
        setActualNextLessonId(null); // Ensure it's null on error
      } finally {
        setIsProcessingScreenLogic(false); // Processing finished, hide loading for button
      }
    };

    markLessonCompleteAndGetNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, points, completeLessonAndProceed, hasAttemptedProcessing]); // Keep dependencies, hasAttemptedProcessing prevents re-runs

  const handleProceed = () => {
    console.log(`[LessonCompleteScreen] handleProceed called. actualNextLessonId: "${actualNextLessonId}"`);
    if (isProcessingScreenLogic || isContextLoading) { // Still loading from context or local processing
      console.log(`[LessonCompleteScreen] Proceed blocked: isProcessingScreenLogic=${isProcessingScreenLogic}, isContextLoading=${isContextLoading}`);
      return;
    }

    if (actualNextLessonId) {
      console.log(`[LessonCompleteScreen] Navigating to next lesson: /lesson/${actualNextLessonId}`);
      router.push(`/lesson/${actualNextLessonId}`);
    } else {
      console.log("[LessonCompleteScreen] No specific next lesson ID or processing error, navigating to home '/'.");
      router.push('/');
    }
  };

  const getButtonText = () => {
    if (isProcessingScreenLogic || isContextLoading) return "Wird gespeichert...";
    return actualNextLessonId ? "Nächste Lektion" : "Zurück zur Lektionsübersicht";
  };

  const getButtonIcon = () => {
    if (isProcessingScreenLogic || isContextLoading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    return actualNextLessonId ? <ArrowRight className="ml-2 h-4 w-4" /> : <HomeIcon className="mr-2 h-4 w-4" />;
  };

  // Initial loading state while useEffect runs for the first time
  if (isProcessingScreenLogic && !hasAttemptedProcessing) {
    return (
        <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Lektion wird abgeschlossen...</p>
        </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg text-center border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
      <CardHeader className="items-center">
        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
        <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">Lektion abgeschlossen!</CardTitle>
         <CardDescription className="text-green-700 dark:text-green-300">
           Du hast die Lektion "{lessonTitle}" beendet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-green-700 dark:text-green-300">
          Herzlichen Glückwunsch! Du hast alle Aufgaben erfolgreich gemeistert.
        </p>
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <p className="text-xl font-semibold text-foreground dark:text-card-foreground">
            Punkte für diese Lektion: <span className="font-bold text-primary">{points}</span>
          </p>
        </div>
         <p className="text-sm text-muted-foreground">
             Dein Gesamtpunktestand und Fortschritt wurden aktualisiert.
         </p>
         <p className="text-xs text-muted-foreground/80 mt-2">
            (DEBUG: User Total Points: {userProgress?.totalPoints ?? 'N/A'}, Context Current Lesson: {userProgress?.currentLessonId ?? 'N/A'}, Determined Next Lesson: {actualNextLessonId ?? 'null'})
         </p>
      </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
           <Link href="/" passHref legacyBehavior>
                <Button variant="outline">
                   <HomeIcon className="mr-2 h-4 w-4" /> Zurück zur Lektionsübersicht
                </Button>
           </Link>
           <Button onClick={handleProceed} disabled={isProcessingScreenLogic || isContextLoading}>
                {getButtonIcon()}
                {getButtonText()}
           </Button>
       </CardFooter>
    </Card>
  );
};
