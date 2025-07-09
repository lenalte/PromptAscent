
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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submittedValue, setSubmittedValue] = useState<string | undefined>(undefined);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  const hasAttempted = submittedValue !== undefined;
  const isInputValid = selectedValue !== undefined;

  const handleSubmit = useCallback(() => {
    if (isReadOnly || hasAttempted || !isInputValid || selectedValue === undefined) return;
    
    setSubmittedValue(selectedValue);
    const selectedIndex = parseInt(selectedValue, 10);
    const correct = selectedIndex === correctOptionIndex;

    setIsCorrect(correct);
    onAnswerSubmit(correct, pointsAwarded, id.toString());
  }, [isReadOnly, hasAttempted, isInputValid, selectedValue, correctOptionIndex, onAnswerSubmit, pointsAwarded, id]);

  useEffect(() => {
    // Reset state when the question ID changes
    setSubmittedValue(undefined);
    setSelectedValue(undefined);
    setIsCorrect(null);
  }, [id]);

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Choose the best answer:</Label>
          <RadioGroup
            onValueChange={setSelectedValue}
            value={selectedValue}
            className="flex flex-col space-y-2"
            disabled={isReadOnly || hasAttempted}
            aria-describedby={hasAttempted ? "feedback-alert" : undefined}
          >
            {options.map((option, index) => (
              <div key={`${id}-option-${index}`} className={cn(
                "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                hasAttempted && index === correctOptionIndex && "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700",
                !hasAttempted && "hover:bg-muted/50"
              )}>
                <RadioGroupItem value={index.toString()} id={`${id}-option-${index}`} disabled={isReadOnly || hasAttempted} />
                <Label htmlFor={`${id}-option-${index}`} className={cn(
                  "font-normal cursor-pointer flex-1",
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
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </AlertTitle>
              <AlertDescription className={cn(isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                {isCorrect
                  ? 'Well done!'
                  : `The correct answer was: "${options[correctOptionIndex]}"`}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {!hasAttempted && !isReadOnly && (
          <EightbitButton onClick={handleSubmit} disabled={!isInputValid}>
            Antwort prüfen
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
