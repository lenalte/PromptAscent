
"use client";

import type React from 'react';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { evaluatePrompt, type EvaluatePromptOutput } from '@/ai/flows/evaluate-prompt';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { EightbitButton } from './ui/eightbit-button';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { CloseIcon } from '@/components/icons/closeIcon';

interface PromptingTaskProps {
  taskDescription: string;
  evaluationGuidance: string;
  pointsAwarded: number;
  onAnswerSubmit: (isCorrect: boolean, pointsChange: number, itemId: string) => void;
  title: string;
  id: number | string;
  isReadOnly?: boolean;
}

export const PromptingTask: React.FC<PromptingTaskProps> = ({
  taskDescription,
  evaluationGuidance,
  pointsAwarded,
  onAnswerSubmit,
  title,
  id,
  isReadOnly = false,
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isPending, startTransition] = useTransition();
  const [evaluationResult, setEvaluationResult] = useState<EvaluatePromptOutput | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [pulsate, setPulsate] = useState(false);

  const MAX_ATTEMPTS = 3;
  const isCorrect = evaluationResult?.isCorrect === true;
  const canAttempt = !isCorrect && attempts < MAX_ATTEMPTS;

  const triggerPulsate = () => {
    setPulsate(true);
    setTimeout(() => setPulsate(false), 1500); // Duration of the animation
  };

  const handleSubmit = useCallback(() => {
    if (isReadOnly || !canAttempt || userPrompt.trim().length < 10) return;

    startTransition(async () => {
      try {
        const result = await evaluatePrompt({
          prompt: userPrompt,
          context: taskDescription,
          evaluationGuidance: evaluationGuidance,
        });
        setEvaluationResult(result);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        const awardedPointsForAttempt = result.isCorrect ? Math.max(0, pointsAwarded - attempts) : 0;
        onAnswerSubmit(result.isCorrect, awardedPointsForAttempt, id.toString());

        if (!result.isCorrect) {
          triggerPulsate();
        }
        
      } catch (error) {
        console.error('Prompt evaluation error:', error);
        const errorResult: EvaluatePromptOutput = {
          score: 0,
          explanation: error instanceof Error ? error.message : 'Bei der Bewertung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
          isCorrect: false,
        };
        setEvaluationResult(errorResult);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        onAnswerSubmit(false, 0, id.toString());
        triggerPulsate();
      }
    });
  }, [isReadOnly, canAttempt, userPrompt, taskDescription, evaluationGuidance, onAnswerSubmit, pointsAwarded, id, attempts]);

  useEffect(() => {
    // Reset state when the question ID changes
    setUserPrompt('');
    setEvaluationResult(null);
    setAttempts(0);
  }, [id]);

  const isComponentReadOnly = isReadOnly || isCorrect || attempts >= MAX_ATTEMPTS;
  const isInputValid = userPrompt.trim().length >= 10;
  const awardedPoints = isCorrect ? Math.max(0, pointsAwarded - (attempts - 1)) : 0;
  const hasSubmittedAndIsIncorrect = evaluationResult !== null && !evaluationResult.isCorrect;

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700", isComponentReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center">
          {title}
        </CardTitle>
        <CardDescription className="text-purple-700 dark:text-purple-400 pt-2 whitespace-pre-line">{taskDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor={`pt-${id}`} className="text-purple-800 dark:text-purple-300">Dein Prompt</Label>
              <Textarea
                id={`pt-${id}`}
                placeholder="Schreibe deinen Prompt hier, um die Aufgabe zu lösen..."
                className={cn(
                  "resize-y min-h-[120px] bg-white dark:bg-background focus:border-purple-500 dark:focus:border-purple-400",
                  hasSubmittedAndIsIncorrect && canAttempt && "ring-2 ring-destructive",
                  pulsate && "animate-pulse-destructive"
                )}
                rows={6}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                aria-describedby={evaluationResult ? "feedback-alert" : undefined}
                disabled={isComponentReadOnly || isPending}
              />
              <p className="text-sm text-purple-600 dark:text-purple-500">
                Erstelle einen Prompt basierend auf der Aufgabenbeschreibung oben. Mindestens 10 Zeichen.
              </p>
            </div>

            {isPending && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    <span>Bewerte...</span>
                </div>
            )}

            {evaluationResult && (
              <Alert
                id="feedback-alert"
                variant={evaluationResult.isCorrect ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
                  evaluationResult.isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700" : "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                )}
              >
                {evaluationResult.isCorrect ? (
                  <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <CloseIcon className="h-4 w-4 text-destructive dark:text-red-400" />
                )}
                <AlertTitle className={cn(evaluationResult.isCorrect ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>
                  {evaluationResult.isCorrect ? `Effektiver Prompt! +${awardedPoints} Punkte` : 'Verbesserungswürdig'}
                </AlertTitle>
                <AlertDescription className={cn("space-y-2", evaluationResult.isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                  <div>Punktzahl: {evaluationResult.score}/100</div>
                  <Progress
                    value={evaluationResult.score}
                    className={cn(
                      "w-full h-2",
                      evaluationResult.score >= 70 ? "[&>*]:bg-green-500 dark:[&>*]:bg-green-400" : 
                      evaluationResult.score >= 40 ? "[&>*]:bg-yellow-500 dark:[&>*]:bg-yellow-400" : 
                      "[&>*]:bg-red-500 dark:[&>*]:bg-red-400"
                    )}
                  />
                  <p className="pt-2 whitespace-pre-line">{evaluationResult.explanation}</p>
                   {!evaluationResult.isCorrect && canAttempt && (
                    <p className="mt-2 font-semibold">Versuche es direkt nochmal!</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="text-sm text-purple-700 dark:text-purple-400 mt-4 p-3 border border-purple-200 dark:border-purple-700 rounded-md bg-purple-100/50 dark:bg-purple-900/30">
              <h4 className="font-semibold mb-1 text-purple-800 dark:text-purple-300">Bewertungsleitfaden:</h4>
              <p className="whitespace-pre-line">{evaluationGuidance}</p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {!isComponentReadOnly && (
          <EightbitButton onClick={handleSubmit} disabled={!isInputValid || isPending}>
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Antwort prüfen'}
          </EightbitButton>
        )}
      </CardFooter>
    </Card>
  );
};
