
"use client";

import type React from 'react';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { validateUserAnswer, type ValidateUserAnswerOutput } from '@/ai/flows/validate-user-answer';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { EightbitButton } from './ui/eightbit-button';


interface FreeResponseQuestionProps {
  question: string;
  expectedAnswer: string;
  pointsAwarded: number;
  onAnswerSubmit: (isCorrect: boolean, pointsChange: number, itemId: string) => void;
  title: string;
  id: number | string;
  isReadOnly?: boolean;
}

type ValidationResult = ValidateUserAnswerOutput & { attemptMade: boolean };

export const FreeResponseQuestion: React.FC<FreeResponseQuestionProps> = ({
  question,
  expectedAnswer,
  pointsAwarded,
  onAnswerSubmit,
  title,
  id,
  isReadOnly = false,
}) => {
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: false, feedback: '', attemptMade: false });
  const [userAnswer, setUserAnswer] = useState('');

  const hasAttempted = validationResult.attemptMade;
  const isInputValid = userAnswer.trim().length > 0;

  const handleSubmit = useCallback(() => {
    if (isReadOnly || hasAttempted || !isInputValid) return;

    setValidationResult({ isValid: false, feedback: '', attemptMade: false });
    startTransition(async () => {
      try {
        const result = await validateUserAnswer({
          question,
          expectedAnswer,
          userAnswer,
        });
        setValidationResult({ ...result, attemptMade: true });
        onAnswerSubmit(result.isValid, pointsAwarded, id.toString());
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({ isValid: false, feedback: 'Error validating answer. Please try again.', attemptMade: true });
        onAnswerSubmit(false, 0, id.toString());
      }
    });
  }, [isReadOnly, hasAttempted, isInputValid, question, expectedAnswer, userAnswer, onAnswerSubmit, pointsAwarded, id]);

  useEffect(() => {
    // Reset state when the question ID changes
    setValidationResult({ isValid: false, feedback: '', attemptMade: false });
    setUserAnswer('');
  }, [id]);

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`frq-${id}`}>Your Answer</Label>
            <Textarea
              id={`frq-${id}`}
              placeholder="Type your answer here..."
              className="resize-none"
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              aria-describedby={validationResult.attemptMade ? "feedback-alert" : undefined}
              disabled={isReadOnly || isPending || hasAttempted}
            />
          </div>

          {isPending && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating...</span>
            </div>
          )}

          {validationResult.attemptMade && (
            <Alert
              id="feedback-alert"
              variant={validationResult.isValid ? 'default' : 'destructive'}
              className={cn(
                "transition-opacity duration-300 ease-in-out",
                validationResult.isValid ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700" : "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700"
              )}
            >
              {validationResult.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive dark:text-red-400" />
              )}
              <AlertTitle className={cn(validationResult.isValid ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>
                {validationResult.isValid ? 'Correct!' : 'Incorrect'}
              </AlertTitle>
              <AlertDescription className={cn(validationResult.isValid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                {validationResult.feedback}
                {!validationResult.isValid && expectedAnswer && (
                  <p className="mt-2">
                    Expected answer guidance: <span className="font-semibold">{expectedAnswer}</span>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {!hasAttempted && !isReadOnly && (
          <EightbitButton onClick={handleSubmit} disabled={!isInputValid || isPending}>
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Antwort prüfen'}
          </EightbitButton>
        )}
        <div className="flex justify-between w-full text-xs text-muted-foreground">
            <p>Correct: +{pointsAwarded} points</p>
            <p>Incorrect: 0 points (max 3 attempts)</p>
        </div>
      </CardFooter>
    </Card>
  );
};
