
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
  const boosterMultiplier = basePointsAdded > 0 && pointsEarnedInStage > basePointsAdded 
    ? pointsEarnedInStage / basePointsAdded 
    : 1;
  const isBoosterActive = boosterMultiplier > 1;

  console.log('[StageCompleteScreen Debug]', {
    pointsEarnedInStage,
    basePointsAdded,
    boosterMultiplier,
    isBoosterActive,
    stageStatus,
  });

  if (stageStatus === 'failed-stage') {
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

  if (stageStatus !== 'completed-perfect' && stageStatus !== 'completed-good') {
    // Return null if the stage is not in a 'completed' state to avoid rendering
    return null;
  }
  
  // --- Start of robust logic ---
  
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

  const pointsColorClass = isBoosterActive 
    ? "text-yellow-500 dark:text-yellow-400" 
    : "text-green-700 dark:text-green-300";
  
  const cardTitleColorClass = allPerfect 
    ? "text-yellow-700 dark:text-yellow-300"
    : "text-green-800 dark:text-green-200";

  const cardContainerClass = allPerfect
    ? "border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20"
    : "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
    
  const mainIcon = allPerfect 
    ? <Trophy className="h-10 w-10 text-yellow-500" />
    : <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />;

  const titleText = allPerfect
    ? "Stufe Perfekt abgeschlossen!"
    : isLastStage ? "Lektion abgeschlossen!" : `Stufe abgeschlossen: ${stageTitle}`;

  const descriptionText = allPerfect
    ? "Perfekt! Alle Aufgaben im ersten Versuch gelöst."
    : "Gut gemacht! Du hast die Stufe abgeschlossen.";

  // --- End of new logic ---

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-md rounded-lg my-4", cardContainerClass)}>
      <CardContent className="p-4">
          <div className="flex items-center space-x-4">
              <div className="shrink-0">{mainIcon}</div>
              <div className="flex-1 text-left">
                  <CardTitle className={cn("text-lg", cardTitleColorClass)}>
                      {titleText}
                  </CardTitle>
                  <CardDescription className="text-sm">
                      {descriptionText}
                  </CardDescription>
              </div>
              <div className="text-right">
                  <p className={cn("font-bold text-lg flex items-center justify-end gap-2", pointsColorClass)}>
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
          </div>
      </CardContent>
    </Card>
  );
};
