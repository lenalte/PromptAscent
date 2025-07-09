
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Trophy, XCircle, Zap, RefreshCw } from 'lucide-react';
import type { StageItemStatus, StageStatusValue, LessonItem } from '@/ai/schemas/lesson-schemas';
import { cn } from '@/lib/utils';
import { EightbitButton } from './ui/eightbit-button';

interface StageCompleteScreenProps {
  stageTitle: string;
  pointsEarnedInStage: number; // This is the final, boosted amount
  basePointsAdded: number; // This is the base points before booster
  stageItemAttempts: { [itemId: string]: StageItemStatus };
  stageItems: LessonItem[];
  isLastStage: boolean;
  stageStatus: StageStatusValue;
  onRestart: () => void;
}

export const StageCompleteScreen: React.FC<StageCompleteScreenProps> = ({
  stageTitle,
  pointsEarnedInStage,
  basePointsAdded,
  stageItemAttempts,
  stageItems,
  isLastStage,
  stageStatus,
  onRestart,
}) => {

  const totalItemsInStage = stageItems.filter(item => item.type !== 'informationalSnippet').length;
  let firstTrySuccesses = 0;

  stageItems.forEach(item => {
    const attemptData = stageItemAttempts[item.id];
    if (attemptData && item.type !== 'informationalSnippet') {
      if (attemptData.correct && attemptData.attempts === 1) {
        firstTrySuccesses++;
      }
    }
  });

  const allPerfect = stageStatus === 'completed-perfect';
  const stageFailed = stageStatus === 'failed-stage';

  const boosterMultiplier = basePointsAdded > 0 ? pointsEarnedInStage / basePointsAdded : 1;
  const isBoosterActive = boosterMultiplier > 1;

  if (stageFailed) {
    return (
      <Card className={cn(
        "w-full max-w-3xl mx-auto shadow-md rounded-lg my-4",
        "border-destructive/50 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
      )}>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-10 w-10 text-destructive mb-3" />
            <CardTitle className="text-lg text-destructive">Stufe nicht geschafft</CardTitle>
            <CardDescription className="text-sm text-destructive/90 mt-1 mb-4">
                Du hast nicht alle Aufgaben bestanden. Versuche es noch einmal!
            </CardDescription>
            <EightbitButton onClick={onRestart}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Stufe wiederholen
            </EightbitButton>
        </CardContent>
      </Card>
    );
  }

  const getTitle = () => {
    if (allPerfect) return "Stufe Perfekt abgeschlossen!";
    return isLastStage ? "Lektion abgeschlossen!" : `Stufe abgeschlossen: ${stageTitle}`;
  };

  const getDescription = () => {
    if (allPerfect) return "Perfekt! Alle Aufgaben im ersten Versuch gelöst.";
    return "Gut gemacht! Du hast die Stufe abgeschlossen.";
  };
  
  const getIcon = () => {
    const iconSize = "h-10 w-10";
    if (allPerfect) return <Trophy className={cn(iconSize, "text-yellow-500")} />;
    return <CheckCircle className={cn(iconSize, "text-green-600 dark:text-green-400")} />;
  }

  return (
    <Card className={cn(
        "w-full max-w-3xl mx-auto shadow-md rounded-lg my-4",
        allPerfect ? "border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20" :
        "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
    )}>
      <CardContent className="p-4">
          <div className="flex items-center space-x-4">
              <div className="shrink-0">{getIcon()}</div>
              <div className="flex-1 text-left">
                  <CardTitle className={cn(
                      "text-lg",
                      allPerfect ? "text-yellow-700 dark:text-yellow-300" : "text-green-800 dark:text-green-200"
                  )}>
                      {getTitle()}
                  </CardTitle>
                  <CardDescription className="text-sm">
                      {getDescription()}
                  </CardDescription>
              </div>
              {!stageFailed && (
                <div className="text-right">
                    <p className="font-bold text-lg text-green-700 dark:text-green-300 flex items-center justify-end gap-2">
                      {isBoosterActive && <Zap className="h-5 w-5 text-yellow-500" />}
                      +{pointsEarnedInStage} Punkte
                    </p>
                    {isBoosterActive && (
                        <p className="text-xs text-muted-foreground">
                            (inkl. {boosterMultiplier.toFixed(1)}x Booster)
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{firstTrySuccesses}/{totalItemsInStage} perfekt</p>
                </div>
              )}
          </div>
      </CardContent>
    </Card>
  );
};
