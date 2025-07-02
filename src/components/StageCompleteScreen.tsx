
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, HomeIcon, ArrowRight, Trophy, XCircle, Loader2 } from 'lucide-react';
import type { StageItemStatus, StageStatusValue, LessonItem } from '@/ai/schemas/lesson-schemas';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StageCompleteScreenProps {
  stageTitle: string;
  pointsEarnedInStage: number;
  stageItemAttempts: { [itemId: string]: StageItemStatus };
  stageItems: LessonItem[];
  onNextStage: () => void;
  onGoHome: () => void;
  isLastStage: boolean;
  stageStatus: StageStatusValue;
  isInteractive: boolean;
}

export const StageCompleteScreen: React.FC<StageCompleteScreenProps> = ({
  stageTitle,
  pointsEarnedInStage,
  stageItemAttempts,
  stageItems,
  onNextStage,
  onGoHome,
  isLastStage,
  stageStatus,
  isInteractive,
}) => {
  const [isProceeding, setIsProceeding] = useState(false);

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

  const getTitle = () => {
    if (stageFailed) return "Stufe nicht geschafft";
    return isLastStage ? "Lektion abgeschlossen!" : `Stufe abgeschlossen: ${stageTitle}`;
  };

  const getDescription = () => {
    if (stageFailed) return "Du hast nicht alle Aufgaben bestanden.";
    if (allPerfect) return "Perfekt! Alle Aufgaben im ersten Versuch gelöst.";
    return "Gut gemacht! Du hast die Stufe abgeschlossen.";
  };
  
  const getIcon = () => {
    const iconSize = "h-10 w-10";
    if (stageFailed) return <XCircle className={cn(iconSize, "text-destructive")} />;
    if (allPerfect) return <Trophy className={cn(iconSize, "text-yellow-500")} />;
    return <CheckCircle className={cn(iconSize, "text-green-600 dark:text-green-400")} />;
  }

  const handleNextStageClick = async () => {
      setIsProceeding(true);
      await onNextStage();
  };

  return (
    <Card className={cn(
        "w-full max-w-3xl mx-auto shadow-md rounded-lg my-4",
        stageFailed ? "border-destructive/50 bg-red-50 dark:border-red-700 dark:bg-red-900/20" :
        allPerfect ? "border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20" :
        "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
    )}>
      <CardContent className="p-4">
          <div className="flex items-center space-x-4">
              <div className="shrink-0">{getIcon()}</div>
              <div className="flex-1 text-left">
                  <CardTitle className={cn(
                      "text-lg",
                      stageFailed ? "text-destructive" : allPerfect ? "text-yellow-700 dark:text-yellow-300" : "text-green-800 dark:text-green-200"
                  )}>
                      {getTitle()}
                  </CardTitle>
                  <CardDescription className="text-sm">
                      {getDescription()}
                  </CardDescription>
              </div>
              {!stageFailed && (
                <div className="text-right">
                    <p className="font-bold text-lg text-green-700 dark:text-green-300">+{pointsEarnedInStage} Punkte</p>
                    <p className="text-xs text-muted-foreground">{firstTrySuccesses}/{totalItemsInStage} perfekt</p>
                </div>
              )}
          </div>
          {isInteractive && (
              <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button variant="outline" onClick={onGoHome} disabled={isProceeding}>
                      <HomeIcon className="mr-2 h-4 w-4" /> Zur Lektionsübersicht
                  </Button>
                  {!stageFailed && (
                    <Button onClick={handleNextStageClick} disabled={isProceeding}>
                      {isProceeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isLastStage ? <Trophy className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />)}
                      {isProceeding ? 'Laden...' : (isLastStage ? 'Zur Lektionsübersicht' : 'Nächste Stufe')}
                    </Button>
                  )}
                   {stageFailed && (
                      <Button onClick={onNextStage} variant="outline" disabled={isProceeding}>
                           {isProceeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                           Stufe Wiederholen
                      </Button>
                  )}
              </div>
          )}
      </CardContent>
    </Card>
  );
};
