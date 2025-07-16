"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { EightbitButton } from './ui/eightbit-button';

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctOptionIndex: number;
  pointsAwarded: number;
  onAnswerSubmit: (isCorrect: boolean, pointsChange: number, itemId: string) => void;
  title: string;
  id: number | string;
  isReadOnly?: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  correctOptionIndex,
  onAnswerSubmit,
  title,
  id,
  pointsAwarded,
  isReadOnly = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
  const [submittedValue, setSubmittedValue] = useState<string | undefined>(undefined);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 3;
  const hasSubmittedCorrectly = isCorrect === true;
  const canAttempt = !hasSubmittedCorrectly && attempts < MAX_ATTEMPTS;

  const handleSubmit = useCallback(() => {
    if (isReadOnly || !canAttempt || selectedValue === undefined) return;
    
    setSubmittedValue(selectedValue);
    const selectedIndex = parseInt(selectedValue, 10);
    const correct = selectedIndex === correctOptionIndex;

    setIsCorrect(correct);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    onAnswerSubmit(correct, correct ? pointsAwarded : 0, id.toString());
    
  }, [isReadOnly, canAttempt, selectedValue, correctOptionIndex, onAnswerSubmit, pointsAwarded, id, attempts]);

  useEffect(() => {
    // Reset state when the question ID changes
    setSelectedValue(undefined);
    setSubmittedValue(undefined);
    setIsCorrect(null);
    setAttempts(0);
  }, [id]);

  const isComponentReadOnly = isReadOnly || hasSubmittedCorrectly;
  const hasAttempted = submittedValue !== undefined;

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg", isComponentReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Wähle die beste Antwort:</Label>
          <RadioGroup
            onValueChange={setSelectedValue}
            value={selectedValue}
            className="flex flex-col space-y-2"
            disabled={isComponentReadOnly}
            aria-describedby={hasAttempted ? "feedback-alert" : undefined}
          >
            {options.map((option, index) => (
              <div key={`${id}-option-${index}`} className={cn(
                "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                hasAttempted && index === correctOptionIndex && "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700",
                !hasAttempted && "hover:bg-muted/50",
                !isComponentReadOnly && "cursor-pointer"
              )}>
                <RadioGroupItem value={index.toString()} id={`${id}-option-${index}`} disabled={isComponentReadOnly} />
                <Label htmlFor={`${id}-option-${index}`} className={cn(
                  "font-normal flex-1",
                  !isComponentReadOnly ? "cursor-pointer" : "cursor-default",
                  hasAttempted && index === correctOptionIndex && "text-green-800 dark:text-green-300",
                  hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "text-red-800 dark:text-red-300"
                )}>
                  {option}
                </Label>
                {hasAttempted && index === correctOptionIndex && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
                {hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && <XCircle className="h-5 w-5 text-destructive dark:text-red-400" />}
              </div>
            ))}
          </RadioGroup>

          {hasAttempted && isCorrect !== null && (
            <Alert
              id="feedback-alert"
              variant={isCorrect ? 'default' : 'destructive'}
              className={cn(
                "transition-opacity duration-300 ease-in-out !mt-6",
                isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700" : "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700"
              )}
            >
              <AlertTitle className={cn(isCorrect ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>
                {isCorrect ? 'Korrekt!' : 'Inkorrekt'}
              </AlertTitle>
              <AlertDescription className={cn(isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                {isCorrect
                  ? 'Gut gemacht!'
                  : `Die richtige Antwort war: "${options[correctOptionIndex]}"`}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {!isComponentReadOnly && canAttempt && (
          <EightbitButton onClick={handleSubmit} disabled={selectedValue === undefined}>
            Antwort prüfen
          </EightbitButton>
        )}
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <p>Korrekt: +{pointsAwarded} Punkte</p>
          <p>Verbleibende Versuche: {Math.max(0, MAX_ATTEMPTS - attempts)}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
