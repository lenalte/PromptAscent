
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctOptionIndex: number;
  pointsForCorrect: number;
  onAnswerSubmit: (isCorrect: boolean, pointsChange: number, itemId: string) => void;
  title: string;
  id: number | string;
  isReadOnly?: boolean;
  isActive?: boolean;
  registerSubmit?: (fn: () => void) => void;
  unregisterSubmit?: () => void;
  onValidityChange?: (isValid: boolean) => void;
}

const formSchema = z.object({
  selectedOption: z.string({ required_error: 'Please select an option.' }),
});

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  correctOptionIndex,
  onAnswerSubmit,
  title,
  id,
  pointsForCorrect,
  isReadOnly = false,
  isActive = false,
  registerSubmit,
  unregisterSubmit,
  onValidityChange,
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submittedValue, setSubmittedValue] = useState<string | undefined>(undefined);
  const hasAttempted = submittedValue !== undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedOption: undefined,
    },
  });

  const { handleSubmit, formState: { isValid } } = form;

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    if (isReadOnly || hasAttempted) return;
    
    setSubmittedValue(values.selectedOption);
    const selectedIndex = parseInt(values.selectedOption, 10);
    const correct = selectedIndex === correctOptionIndex;

    setIsCorrect(correct);
    onAnswerSubmit(correct, pointsForCorrect, id.toString());
  }, [isReadOnly, hasAttempted, correctOptionIndex, onAnswerSubmit, pointsForCorrect, id]);
  
  useEffect(() => {
    // Reset state when the question ID changes
    form.reset({ selectedOption: undefined });
    setIsCorrect(null);
    setSubmittedValue(undefined);
  }, [id, form]);

  useEffect(() => {
    if (isActive && !isReadOnly && registerSubmit && unregisterSubmit) {
      registerSubmit(handleSubmit(onSubmit));
      return () => {
        unregisterSubmit();
      };
    }
  }, [isActive, isReadOnly, registerSubmit, unregisterSubmit, handleSubmit, onSubmit]);

  useEffect(() => {
    if (isActive && !isReadOnly && onValidityChange) {
      onValidityChange(isValid);
    }
  }, [isValid, isActive, isReadOnly, onValidityChange]);


  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="selectedOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose the best answer:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                      disabled={isReadOnly || hasAttempted}
                      aria-describedby={hasAttempted ? "feedback-alert" : undefined}
                    >
                      {options.map((option, index) => (
                        <FormItem key={`${id}-option-${index}`} className={cn(
                          "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                          hasAttempted && index === correctOptionIndex && "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                          hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700",
                          !hasAttempted && "hover:bg-muted/50"
                        )}
                        >
                          <FormControl>
                            <RadioGroupItem value={index.toString()} disabled={isReadOnly || hasAttempted} />
                          </FormControl>
                          <FormLabel className={cn(
                            "font-normal cursor-pointer flex-1",
                            hasAttempted && index === correctOptionIndex && "text-green-800 dark:text-green-300",
                            hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "text-red-800 dark:text-red-300"
                          )}>
                            {option}
                          </FormLabel>
                          {hasAttempted && index === correctOptionIndex && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
                          {hasAttempted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && <XCircle className="h-5 w-5 text-destructive dark:text-red-400" />}
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasAttempted && isCorrect !== null && (
              <Alert
                id="feedback-alert"
                variant={isCorrect ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
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

          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
        <p>Correct: +{pointsForCorrect} points</p>
        <p>Incorrect: 0 points (max 3 attempts)</p>
      </CardFooter>
    </Card>
  );
};
