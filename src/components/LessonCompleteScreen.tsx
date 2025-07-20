"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { HomeIcon } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import { LeaderboardIcon } from './icons/LeaderboardIcon';

interface LessonCompleteScreenProps {
  onGoHome: () => void;
  onGoToNextLesson?: () => void;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ onGoHome, onGoToNextLesson }) => {
  const { isLoadingProgress: isContextLoading, userProgress } = useUserProgress();
  const totalPoints = userProgress?.totalPoints ?? 0;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg text-center">
      <CardHeader className="items-center">
        <LeaderboardIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
          Lektion abgeschlossen!
        </CardTitle>
        <CardDescription className="text-green-700 dark:text-green-300">
          Herzlichen Glückwunsch! Du hast die Lektion erfolgreich beendet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-2 pt-4">
          <p className="text-xl font-semibold text-foreground dark:text-card-foreground">
            Gesamtpunktestand: <span className="font-bold text-foreground">{totalPoints}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
        <EightbitButton onClick={onGoHome} disabled={isContextLoading}>
          <HomeIcon className="mr-2 h-4 w-4" /> Zurück zur Übersicht
        </EightbitButton>
      </CardFooter>
    </Card>
  );
};
