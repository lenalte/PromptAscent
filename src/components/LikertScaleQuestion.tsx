"use client";

import type React from 'react';
import { useState, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { EightbitButton } from './ui/eightbit-button';
import { saveLikertScaleAnswer } from '@/services/userProgressService';
import { CheckIcon } from './icons/CheckIcon';
import { StarIcon } from './icons/StarIcon';

interface LikertScaleQuestionProps {
  question: string;
  pointsAwarded: number;
  onAnswerSubmit: (isCorrect: boolean, pointsChange: number, itemId: string, answer?: number) => void;
  title: string;
  id: string;
  isReadOnly?: boolean;
  lessonId: string;
}

const LIKERT_OPTIONS = [
  "Trifft gar nicht zu",
  "Trifft eher nicht zu",
  "Neutral",
  "Trifft eher zu",
  "Trifft voll und ganz zu"
];

export const LikertScaleQuestion: React.FC<LikertScaleQuestionProps> = ({
  question,
  pointsAwarded,
  onAnswerSubmit,
  title,
  id,
  isReadOnly = false,
  lessonId
}) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(async () => {
    if (isReadOnly || !selectedValue) return;

    startTransition(async () => {
      try {
        const answerIndex = parseInt(selectedValue, 10);
        await saveLikertScaleAnswer({
          lessonId: lessonId,
          questionId: id,
          answer: answerIndex
        });

        onAnswerSubmit(true, pointsAwarded, id, answerIndex);

      } catch (error) {
        console.error('Likert scale submission error:', error);
        onAnswerSubmit(true, 0, id.toString(), parseInt(selectedValue, 10));
      }
    });
  }, [isReadOnly, selectedValue, id, lessonId, onAnswerSubmit, pointsAwarded]);

  const isComponentReadOnly = isReadOnly;

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-accent bg-card", isComponentReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardDescription className="text-accent flex items-center">
          <StarIcon className="mr-3 h-5 w-5" /> {title}
        </CardDescription>
        <CardTitle className="text-xl text-accent pt-2">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* <Label className="text-accent">Deine Einschätzung:</Label> */}
          <RadioGroup
            onValueChange={setSelectedValue}
            value={selectedValue}
            className="flex flex-row justify-between items-end pt-2"
            disabled={isComponentReadOnly || isPending}
          >
            {LIKERT_OPTIONS.map((option, index) => (
              <div key={`${id}-option-${index}`} className="flex flex-col items-center space-y-2 text-center flex-1 px-1">
                <Label
                  htmlFor={`${id}-option-${index + 1}-text`}
                  className={cn(
                    "text-xs text-muted-foreground h-10 flex items-center",
                    !isComponentReadOnly ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  {option}
                </Label>
                <div className={cn(
                  "flex items-center flex-col space-y-2 p-2 rounded-md w-full justify-center",
                  !isComponentReadOnly && "cursor-pointer"
                )}>
                  <Label
                    htmlFor={`${id}-option-${index + 1}`}
                    className={cn(
                      "font-medium text-lg text-white",
                      !isComponentReadOnly ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    {index + 1}
                  </Label>
                  <RadioGroupItem
                    value={(index + 1).toString()}
                    id={`${id}-option-${index + 1}`}
                    className="h-6 w-6"
                    disabled={isComponentReadOnly || isPending}
                  />
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {!isComponentReadOnly && (
          <EightbitButton onClick={handleSubmit} disabled={selectedValue === undefined || isPending}>
            {isPending ? 'Speichern...' : 'Antwort absenden'}
          </EightbitButton>
        )}
        {isComponentReadOnly && (
          <div className="flex items-center text-green-500 dark:text-green-400 font-semibold">
            <CheckIcon className="mr-2 h-5 w-5 text-green-500 dark:text-green-400" /> Danke für dein Feedback!
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
