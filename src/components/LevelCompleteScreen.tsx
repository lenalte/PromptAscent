"use client";

import type React from 'react';
import { EightbitButton } from '@/components/ui/eightbit-button';
import Image from 'next/image';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import FireworkBackground from './FireworkBackground';

interface LevelCompleteScreenProps {
  onGoHome: () => void;
  levelTitle: string;
  badgeName: string;
  badgeIcon?: React.ReactNode; // Optional: für eigene Badges statt Standard-Icon
  badgeImageUrl?: string;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  onGoHome,
  levelTitle,
  badgeName,
  badgeIcon,
  badgeImageUrl,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <FireworkBackground />

      <div className="w-full h-full flex flex-col items-center justify-center">
        <LeaderboardIcon className="h-20 w-20 text-accent mb-6 animate-bounce" />
        <h2 className="text-4xl font-bold text-accent mb-3">Level abgeschlossen!</h2>
        <p className="text-xl text-white mb-8 text-center max-w-xl mx-auto">
          Wow, du hast das Level <span className="font-bold">{levelTitle}</span> gemeistert!
        </p>
        <div className="flex flex-col items-center justify-center mb-8">
          {badgeImageUrl ? (
            <Image
              src={badgeImageUrl}
              alt={badgeName}
              width={180}
              height={180}
              className="drop-shadow-lg mb-3"
              data-ai-hint="level badge"
            />
          ) : badgeIcon ? (
            <span className="mb-3 drop-shadow-lg">{badgeIcon}</span>
          ) : (
            <span className="mb-3 text-6xl">🏅</span>
          )}
          <div className="mt-4 text-lg font-semibold text-accent/90">
            Du hast das <span className="font-bold">{badgeName}</span>-Badge erhalten!
          </div>
          <span className="text-base text-accent/80 font-medium mb-4 mt-1">
            Deine Prompts könnten sogar R2-D2 zum Reden bringen. Möge die KI stets mit dir sein!
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <EightbitButton onClick={onGoHome} className="text-lg">
            Zurück zur Übersicht
          </EightbitButton>
        </div>
      </div>
    </div>
  );
};
