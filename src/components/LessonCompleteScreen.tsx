
"use client";

import type React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { CheckCircle, Trophy, HomeIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import { useRouter } from 'next/navigation';

interface LessonCompleteScreenProps {
  points: number; // Points earned in *this* lesson
  lessonTitle: string;
  lessonId: string;
  nextLessonId: string | null;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ points, lessonTitle, lessonId, nextLessonId }) => {
  const { isLoadingProgress: isContextLoading, userProgress } = useUserProgress();
  const router = useRouter();

  const handleProceed = () => {
    if (isContextLoading) return; // Prevent navigation while any context operation is in flight

    if (nextLessonId) {
      console.log(`[LessonCompleteScreen] Navigating to next lesson: /lesson/${nextLessonId}`);
      router.push(`/lesson/${nextLessonId}`);
    } else {
      console.log("[LessonCompleteScreen] No specific next lesson ID, navigating to home '/'.");
      router.push('/');
    }
  };

  const getButtonText = () => {
    if (isContextLoading) return "Wird gespeichert...";
    return nextLessonId ? "Nächste Lektion" : "Zurück zur Lektionsübersicht";
  };

  const getButtonIcon = () => {
    if (isContextLoading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    return nextLessonId ? <ArrowRight className="ml-2 h-4 w-4" /> : <HomeIcon className="mr-2 h-4 w-4" />;
  };

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
            (DEBUG: User Total Points: {userProgress?.totalPoints ?? 'N/A'}, Context Current Lesson: {userProgress?.currentLessonId ?? 'N/A'}, Determined Next Lesson: {nextLessonId ?? 'null'})
         </p>
      </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
           <Link href="/" passHref>
                <EightbitButton as="a">
                   <HomeIcon className="mr-2 h-4 w-4" /> Zurück zur Lektionsübersicht
                </EightbitButton>
           </Link>
           <EightbitButton onClick={handleProceed} disabled={isContextLoading}>
                {getButtonIcon()}
                {getButtonText()}
           </EightbitButton>
       </CardFooter>
    </Card>
  );
};
