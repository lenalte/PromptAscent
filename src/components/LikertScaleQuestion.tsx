"use client";

import type React from 'react';
import { useState, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { EightbitButton } from './ui/eightbit-button';
import { saveLikertScaleAnswer } from '@/services/userProgressService';
import { useToast } from '@/hooks/use-toast';
import { Check, Star } from 'lucide-react';

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
  const { toast } = useToast();
  
  const handleSubmit = useCallback(async () => {
    if (isReadOnly || !selectedValue) return;

    startTransition(async () => {
      try {
        const answerIndex = parseInt(selectedValue, 10);
        // Call the anonymous save function, which no longer needs a userId
        await saveLikertScaleAnswer({ 
            lessonId: lessonId, 
            questionId: id, 
            answer: answerIndex 
        });
        
        // This type of question is always "correct" for progression, but points are only awarded once.
        onAnswerSubmit(true, pointsAwarded, id, answerIndex);
        
        toast({
            title: "Feedback gespeichert",
            description: "Danke für deine ehrliche Antwort!",
            className: "bg-green-100 border-green-400"
        });

      } catch (error) {
        console.error('Likert scale submission error:', error);
        toast({
            title: "Fehler",
            description: "Deine Antwort konnte nicht gespeichert werden. Bitte versuche es erneut.",
            variant: "destructive"
        });
        // We still mark as complete to avoid blocking the user
        onAnswerSubmit(true, 0, id.toString(),  parseInt(selectedValue, 10));
      }
    });
  }, [isReadOnly, selectedValue, id, lessonId, onAnswerSubmit, pointsAwarded, toast]);

  const isComponentReadOnly = isReadOnly;

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700", isComponentReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center">
            <Star className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-400 pt-2">{question}</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="space-y-3">
            <Label className="text-amber-800 dark:text-amber-300">Deine Einschätzung:</Label>
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
                    "flex items-center flex-col space-y-2 p-2 rounded-md border-2 w-full justify-center",
                    selectedValue === (index + 1).toString()
                      ? "border-amber-500 bg-amber-100 dark:bg-amber-900/40"
                      : "border-transparent",
                    !isComponentReadOnly && "cursor-pointer hover:bg-amber-100/50"
                  )}>
                    <Label
                      htmlFor={`${id}-option-${index + 1}`}
                      className={cn(
                        "font-medium text-lg",
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
            <div className="flex items-center text-green-600 font-semibold">
                <Check className="mr-2 h-5 w-5" /> Danke für dein Feedback!
            </div>
        )}
      </CardFooter>
    </Card>
  );
};
