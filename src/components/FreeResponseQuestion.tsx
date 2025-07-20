
"use client";

import type React from 'react';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { validateUserAnswer, type ValidateUserAnswerOutput } from '@/ai/flows/validate-user-answer';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { EightbitButton } from './ui/eightbit-button';
import { CheckIcon } from '@/components/icons/CheckIcon';


interface FreeResponseQuestionProps {
  question: string;
  expectedAnswer: string;
  pointsAwarded: number;
  onAnswerSubmit: (isCorrect: boolean, pointsChange: number, itemId: string) => void;
  title: string;
  id: number | string;
  isReadOnly?: boolean;
}

export const FreeResponseQuestion: React.FC<FreeResponseQuestionProps> = ({
  question,
  expectedAnswer,
  pointsAwarded,
  onAnswerSubmit,
  title,
  id,
  isReadOnly = false,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ValidateUserAnswerOutput | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [pulsate, setPulsate] = useState(false);

  const MAX_ATTEMPTS = 3;
  const isCorrect = result?.isValid === true;
  const canAttempt = !isCorrect && attempts < MAX_ATTEMPTS;

  const triggerPulsate = () => {
    setPulsate(true);
    setTimeout(() => setPulsate(false), 1500); // Duration of the animation
  };

  const handleSubmit = useCallback(() => {
    if (isReadOnly || !canAttempt || userAnswer.trim().length === 0) return;

    startTransition(async () => {
      try {
        const validation = await validateUserAnswer({
          question,
          expectedAnswer,
          userAnswer,
        });
        setResult(validation);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        const awardedPointsForAttempt = validation.isValid ? Math.max(0, pointsAwarded - attempts) : 0;
        onAnswerSubmit(validation.isValid, awardedPointsForAttempt, id.toString());

        if (!validation.isValid) {
            triggerPulsate();
        }

      } catch (error) {
        console.error('Validation error:', error);
        setResult({ isValid: false, feedback: error instanceof Error ? error.message : 'Bei der Überprüfung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.' });
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        onAnswerSubmit(false, 0, id.toString());
        triggerPulsate();
      }
    });
  }, [isReadOnly, canAttempt, userAnswer, question, expectedAnswer, onAnswerSubmit, pointsAwarded, id, attempts]);

  useEffect(() => {
    // Reset state when the question ID changes
    setResult(null);
    setUserAnswer('');
    setAttempts(0);
  }, [id]);

  const isComponentReadOnly = isReadOnly || isCorrect || attempts >= MAX_ATTEMPTS;
  const awardedPoints = isCorrect ? Math.max(0, pointsAwarded - (attempts - 1)) : 0;
  const hasSubmittedAndIsIncorrect = result !== null && !result.isValid;

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg", isComponentReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`frq-${id}`}>Deine Antwort</Label>
            <Textarea
              id={`frq-${id}`}
              placeholder="Gib hier deine Antwort ein..."
              className={cn(
                "resize-none",
                hasSubmittedAndIsIncorrect && canAttempt && "ring-2 ring-destructive",
                pulsate && "animate-pulse-destructive"
              )}
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              aria-describedby={result ? "feedback-alert" : undefined}
              disabled={isComponentReadOnly || isPending}
            />
          </div>

          {isPending && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Überprüfe...</span>
            </div>
          )}

          {result && (
            <Alert
              id="feedback-alert"
              variant={result.isValid ? 'default' : 'destructive'}
              className={cn(
                "transition-opacity duration-300 ease-in-out",
                result.isValid ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700" : "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700"
              )}
            >
              {result.isValid ? (
                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <CheckIcon className="h-4 w-4 text-destructive dark:text-red-400" />
              )}
              <AlertTitle className={cn(result.isValid ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>
                {result.isValid ? `Korrekt! +${awardedPoints} Punkte` : 'Inkorrekt'}
              </AlertTitle>
              <AlertDescription className={cn(result.isValid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                {result.feedback}
                 {!result.isValid && canAttempt && (
                  <p className="mt-2 font-semibold">Versuche es direkt nochmal!</p>
                )}
                {!result.isValid && !canAttempt && expectedAnswer && (
                  <p className="mt-2">
                    Die erwartete Antwort (Leitfaden) war: <span className="font-semibold">{expectedAnswer}</span>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {!isComponentReadOnly && (
          <EightbitButton onClick={handleSubmit} disabled={userAnswer.trim().length === 0 || isPending}>
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Antwort prüfen'}
          </EightbitButton>
        )}
        <div className="flex justify-between w-full text-xs text-muted-foreground">
            <p>Max. Punkte: +{pointsAwarded}</p>
            <p>Verbleibende Versuche: {Math.max(0, MAX_ATTEMPTS - attempts)}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
