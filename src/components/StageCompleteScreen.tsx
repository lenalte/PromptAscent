
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, XCircle } from 'lucide-react';
import type { StageItemStatus, StageStatusValue, LessonItem } from '@/ai/schemas/lesson-schemas';
import { cn } from '@/lib/utils';
import { EightbitButton } from './ui/eightbit-button';
import { useUserProgress } from '@/context/UserProgressContext';

import { LightbulbIcon } from './icons/LightbulbIcon';
import { ApplyIcon } from './icons/ApplyIcon';
import { VaryIcon } from './icons/VaryIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { RepeatIcon } from './icons/RepeatIcon';
import { PassIcon } from './icons/PassIcon';
import { BossIcon } from './icons/BossIcon';

interface StageCompleteScreenProps {
  stageId: string;
  stageTitle: string;
  basePointsAdded: number;
  stageItemAttempts: { [itemId: string]: StageItemStatus };
  stageItems: LessonItem[];
  isLastStage: boolean;
  stageStatus: StageStatusValue;
  onRestart: () => void;
}

const STAGE_ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  stage1: LightbulbIcon,
  stage2: ApplyIcon,
  stage3: VaryIcon,
  stage4: MagnifyingGlassIcon,
  stage5: RepeatIcon,
  stage6: PassIcon,
};


export const StageCompleteScreen: React.FC<StageCompleteScreenProps> = ({
  stageId,
  stageTitle,
  basePointsAdded,
  stageItemAttempts,
  stageItems,
  isLastStage,
  stageStatus,
  onRestart,
}) => {
  const { userProgress } = useUserProgress();
  const activeBooster = userProgress?.activeBooster;
  const activeBoosterMultiplier = (activeBooster && Date.now() < activeBooster.expiresAt)
    ? activeBooster.multiplier
    : null;

  const isBoosterActive = activeBoosterMultiplier !== null && activeBoosterMultiplier > 1;
  const pointsEarnedInStage = isBoosterActive ? Math.round(basePointsAdded * activeBoosterMultiplier) : basePointsAdded;
  
  if (stageStatus === 'failed-stage') {
    return (
      <Card className={cn(
        "w-full max-w-3xl mx-auto shadow-md rounded-lg my-4",
        "border-destructive/50 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
      )}>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-10 w-10 text-destructive mb-3" />
            <CardTitle className="text-lg text-destructive">{stageTitle}</CardTitle>
            <CardDescription className="text-sm text-destructive/90 mt-1 mb-4">
                Du hast nicht alle Aufgaben bestanden. Versuche es noch einmal!
            </CardDescription>
            <EightbitButton onClick={onRestart}>
                <RepeatIcon className="mr-2 h-4 w-4" />
                Stufe wiederholen
            </EightbitButton>
        </CardContent>
      </Card>
    );
  }

  if (stageStatus !== 'completed-perfect' && stageStatus !== 'completed-good') {
    return null;
  }
  
  const totalItemsInStage = stageItems.filter(item => item.type !== 'informationalSnippet' && item.type !== 'likertScale').length;
  let firstTrySuccesses = 0;
  stageItems.forEach(item => {
    const attemptData = stageItemAttempts[item.id];
    if (attemptData && item.type !== 'informationalSnippet' && item.type !== 'likertScale') {
      if (attemptData.correct && (attemptData.attempts ?? 1) === 1) {
        firstTrySuccesses++;
      }
    }
  });

  const allPerfect = stageStatus === 'completed-perfect';

  const pointsColorClass = isBoosterActive
    ? "text-yellow-500 dark:text-yellow-400"
    : "text-green-700 dark:text-green-300";
  
  const cardTitleColorClass = "text-green-800 dark:text-green-200";

  const cardContainerClass = "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
    
  const StageIcon = STAGE_ICONS[stageId] || Trophy; // Fallback to Trophy icon
  const iconColorClass = "text-green-600 dark:text-green-400";
  
  const mainIcon = <StageIcon className={cn("h-10 w-10", iconColorClass)} />;

  let descriptionText = allPerfect
    ? "Perfekt! Alle Aufgaben im ersten Versuch gelöst."
    : "Gut gemacht! Du hast die Stufe abgeschlossen.";

  if (isLastStage) {
    descriptionText = "Herzlichen Glückwunsch! Du hast die letzte Stufe und damit die Lektion beendet.";
  }

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-md rounded-lg my-4", cardContainerClass)}>
      <CardContent className="p-4">
          <div className="flex items-center space-x-4">
              <div className="shrink-0">{mainIcon}</div>
              <div className="flex-1 text-left">
                  <CardTitle className={cn("text-lg", cardTitleColorClass)}>
                      {stageTitle}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                      {descriptionText}
                  </CardDescription>
              </div>
              <div className="text-right">
                  <p className={cn("font-bold text-lg flex items-center justify-end gap-2", pointsColorClass)}>
                    {isBoosterActive && <BossIcon className="h-5 w-5 text-yellow-500 animate-pulse" />}
                    +{pointsEarnedInStage} Punkte
                  </p>
                  {isBoosterActive && (
                      <p className="text-xs text-muted-foreground">
                          (inkl. {activeBoosterMultiplier.toFixed(1)}x Booster)
                      </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{firstTrySuccesses}/{totalItemsInStage} perfekt</p>
              </div>
          </div>
      </CardContent>
    </Card>
  );
};
