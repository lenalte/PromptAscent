"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { HomeIcon, Medal, Trophy } from 'lucide-react';
import Image from 'next/image';


interface LevelCompleteScreenProps {
  onGoHome: () => void;
  levelTitle: string;
  badgeName: string;
  badgeIcon?: React.ReactNode; // Optional: für eigene Badges statt Standard-Icon
  badgeImageUrl?: string; // Add imageUrl prop
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  onGoHome,
  levelTitle,
  badgeName,
  badgeIcon,
  badgeImageUrl,
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg text-center border-yellow-500 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 animate-in fade-in">
      <CardHeader className="items-center">
        <Medal className="h-20 w-20 text-yellow-500 mb-4 animate-bounce" />
        <CardTitle className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">Level abgeschlossen!</CardTitle>
        <CardDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
          Wow, du hast das Level <span className="font-bold">{levelTitle}</span> gemeistert!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center pt-4">
        {badgeImageUrl ? (
            <Image
                src={badgeImageUrl}
                alt={badgeName}
                width={128}
                height={128}
                className="drop-shadow-lg"
                data-ai-hint="level badge"
            />
          ) : badgeIcon ? (
            <span className="mb-2 drop-shadow-lg">{badgeIcon}</span>
          ) : (
            <span className="mb-2">🏅</span>
          )}
          <div className="mt-2 text-lg font-semibold text-foreground dark:text-card-foreground">
            Du hast das <span className="font-bold">{badgeName}</span>-Badge erhalten!
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Trophy className="h-8 w-8 mr-2 text-yellow-500" />
          <span className="text-base text-yellow-900 dark:text-yellow-200 font-medium">
            Weiter so – das nächste Level wartet schon auf dich!
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
        <EightbitButton onClick={onGoHome}>
          <HomeIcon className="mr-2 h-4 w-4" /> Zurück zur Übersicht
        </EightbitButton>
      </CardFooter>
    </Card>
  );
};
