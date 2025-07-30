'use client';

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { useUserProgress } from '@/context/UserProgressContext';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { PointsIcon } from './icons/PointsIcon';
import FireworkBackground from './FireworkBackground';

interface LessonCompleteScreenProps {
  onGoHome: () => void;
  onGoToNextLesson?: () => void;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ onGoHome, onGoToNextLesson }) => {
  const { isLoadingProgress: isContextLoading, userProgress } = useUserProgress();
  const totalPoints = userProgress?.totalPoints ?? 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <FireworkBackground />
      {/* Das komplette Overlay ist jetzt ein bunter Verlauf */}
      <div className="w-full h-full flex flex-col items-center justify-center">

        <LeaderboardIcon className="h-20 w-20 text-[#00FF6A] mb-6 animate-bounce" />
        <h2 className="text-4xl font-bold text-[#00FF6A] mb-3">Prompt-tastisch!</h2>
        <p className="text-xl text-white mb-8 text-center max-w-xl mx-auto">
          Herzlichen Glückwunsch! Du hast die Lektion erfolgreich beendet. Wenn du so weitermachst, wird ChatGPT bald dich um Hilfe bitten!
        </p>
        <div className="flex items-center justify-center mb-8">
          <Card className="flex items-center px-6 py-4 gap-3 bg-card/90 shadow-lg">

            <p className="text-xl font-semibold text-white">
              Punkte: <span className="pl-2 font-bold text-[#00FF6A]">{totalPoints}</span>
            </p>
            <PointsIcon className="h-8 w-8 text-[#00FF6A]" />
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <EightbitButton onClick={onGoHome} disabled={isContextLoading} className="text-lg">
            Zurück zur Übersicht
          </EightbitButton>
        </div>
      </div>
    </div>
  );
};


