
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, HomeIcon, ArrowRight, Trophy, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { StageItemStatus, StageStatusValue, LessonItem } from '@/ai/schemas/lesson-schemas';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StageCompleteScreenProps {
  stageTitle: string;
  pointsEarnedInStage: number;
  stageItemAttempts: { [itemId: string]: StageItemStatus };
  stageItems: LessonItem[]; // All items definition for this stage
  onNextStage: () => void;
  onGoHome: () => void;
  isLastStage: boolean; // To know if this is the last stage before lesson completion
  stageStatus: StageStatusValue; // 'completed-perfect', 'completed-good', 'failed-stage'
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
}) => {
  const [isProceeding, setIsProceeding] = useState(false);

  const totalItemsInStage = stageItems.length;
  let firstTrySuccesses = 0;
  let itemsWithRetries = 0;
  let itemsFailedAfterMaxAttempts = 0;

  stageItems.forEach(item => {
    const attemptData = stageItemAttempts[item.id];
    if (attemptData) {
      if (attemptData.correct && attemptData.attempts === 1) {
        firstTrySuccesses++;
      } else if (attemptData.correct && attemptData.attempts > 1) {
        itemsWithRetries++;
      } else if (attemptData.correct === false && attemptData.attempts >= 3) {
        itemsFailedAfterMaxAttempts++;
      }
    }
  });

  const allPerfect = stageStatus === 'completed-perfect';
  const completedWithGoodEffort = stageStatus === 'completed-good';
  const stageFailed = stageStatus === 'failed-stage';

  const getTitle = () => {
    if (stageFailed) return "Stufe nicht geschafft";
    return isLastStage ? "Lektion abgeschlossen!" : `${stageTitle} abgeschlossen!`;
  };

  const getDescription = () => {
    if (stageFailed) return "Du hast nicht alle Aufgaben innerhalb der maximalen Versuche bestanden.";
    if (allPerfect) return "Perfekt! Alle Aufgaben im ersten Versuch gelöst.";
    if (completedWithGoodEffort) return "Gut gemacht! Du hast die Stufe abgeschlossen.";
    return "Du hast diese Stufe abgeschlossen.";
  };
  
  const getIcon = () => {
    if (stageFailed) return <XCircle className="h-16 w-16 text-destructive mb-4" />;
    if (allPerfect) return <Trophy className="h-16 w-16 text-yellow-500 mb-4" />;
    return <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />;
  }

  const handleNextStageClick = async () => {
      setIsProceeding(true);
      await onNextStage();
      // isProceeding will remain true as the component might unmount.
  };

  return (
    <Card className={cn(
        "w-full max-w-2xl mx-auto shadow-lg rounded-lg text-center my-8", // Added margin for inline display
        stageFailed ? "border-destructive bg-red-50 dark:border-red-700 dark:bg-red-900/20" :
        allPerfect ? "border-yellow-500 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20" :
        "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
    )}>
      <CardHeader className="items-center">
        {getIcon()}
        <CardTitle className={cn(
            "text-2xl font-bold",
            stageFailed ? "text-destructive" : allPerfect ? "text-yellow-700 dark:text-yellow-300" : "text-green-800 dark:text-green-200"
        )}>
            {getTitle()}
        </CardTitle>
        <CardDescription className={cn(
             stageFailed ? "text-red-700 dark:text-red-300" : allPerfect ? "text-yellow-600 dark:text-yellow-400" : "text-green-700 dark:text-green-300"
        )}>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={cn("text-lg", stageFailed ? "text-red-700" : "text-green-700 dark:text-green-300")}>
          Punkte für diese Stufe: <span className="font-bold">{pointsEarnedInStage}</span>
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Aufgaben im ersten Versuch richtig: {firstTrySuccesses} / {totalItemsInStage}</p>
          <p>Aufgaben mit Wiederholungen gelöst: {itemsWithRetries} / {totalItemsInStage}</p>
          {itemsFailedAfterMaxAttempts > 0 && (
            <p className="text-destructive">Aufgaben nach 3 Versuchen nicht gelöst: {itemsFailedAfterMaxAttempts} / {totalItemsInStage}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 space-y-2 sm:space-y-0 sm:space-x-4">
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
      </CardFooter>
    </Card>
  );
};
