
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctOptionIndex: number;
  pointsForCorrect: number;
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  isAnswerSubmitted: boolean;
  isLastItem: boolean;
  onNextQuestion: () => void;
  title: string;
  id: number | string;
  lessonPoints: number;
  isReadOnly?: boolean;
}

const formSchema = z.object({
  selectedOption: z.string({ required_error: 'Please select an option.' }),
});

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  correctOptionIndex,
  pointsForCorrect,
  pointsForIncorrect,
  onAnswerSubmit,
  isAnswerSubmitted,
  isLastItem,
  onNextQuestion,
  lessonPoints,
  title,
  id,
  isReadOnly = false,
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedValue, setSubmittedValue] = useState<string | undefined>(undefined);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedOption: undefined,
    },
  });

  useEffect(() => {
    // Reset internal state when the question changes (identified by id)
    // but not when isAnswerSubmitted changes, to preserve feedback.
    form.reset({ selectedOption: undefined });
    setIsCorrect(null);
    setIsLoading(false);
    setSubmittedValue(undefined);
  }, [id, question, form]);

  const handleButtonClick = () => {
    if (!isAnswerSubmitted) {
      form.handleSubmit(onSubmit)();
    } else {
      onNextQuestion();
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSubmittedValue(values.selectedOption);
    const selectedIndex = parseInt(values.selectedOption, 10);
    const correct = selectedIndex === correctOptionIndex;

    setIsCorrect(correct);
    onAnswerSubmit(correct);
    setIsLoading(false);
  };

  const getButtonText = () => {
    if (isLoading) return 'Checking...';
    if (!isAnswerSubmitted) return 'Submit Answer';
    return isLastItem ? `Complete Stage` : 'Next';
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto shadow-lg rounded-lg", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
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
                      disabled={isReadOnly || isAnswerSubmitted || isLoading}
                      aria-describedby={isAnswerSubmitted ? "feedback-alert" : undefined}
                    >
                      {options.map((option, index) => (
                        <FormItem key={`${id}-option-${index}`} className={cn(
                          "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                          isAnswerSubmitted && index === correctOptionIndex && "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                          isAnswerSubmitted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700",
                          !isAnswerSubmitted && "hover:bg-muted/50"
                        )}
                        >
                          <FormControl>
                            <RadioGroupItem value={index.toString()} disabled={isReadOnly || isAnswerSubmitted || isLoading} />
                          </FormControl>
                          <FormLabel className={cn(
                            "font-normal cursor-pointer flex-1",
                            isAnswerSubmitted && index === correctOptionIndex && "text-green-800 dark:text-green-300",
                            isAnswerSubmitted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && "text-red-800 dark:text-red-300"
                          )}>
                            {option}
                          </FormLabel>
                          {isAnswerSubmitted && index === correctOptionIndex && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
                          {isAnswerSubmitted && index !== correctOptionIndex && parseInt(submittedValue ?? '-1') === index && <XCircle className="h-5 w-5 text-destructive dark:text-red-400" />}
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAnswerSubmitted && isCorrect !== null && (
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

            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={isReadOnly || isLoading || (!isAnswerSubmitted && !form.formState.isValid)}
              className={cn(
                "w-full sm:w-auto disabled:opacity-50",
                !isAnswerSubmitted ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90",
                isLastItem && isAnswerSubmitted && "bg-green-600 hover:bg-green-700"
              )}
            >
              <span className="flex items-center justify-center">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && isAnswerSubmitted && isLastItem && <Trophy className="mr-2 h-4 w-4" />}
                {getButtonText()}
                {!isLoading && isAnswerSubmitted && !isLastItem && <ArrowRight className="ml-2 h-4 w-4" />}
              </span>
            </Button>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
        <p>Correct: +{pointsForCorrect} points</p>
        <p>Incorrect: {pointsForIncorrect > 0 ? `-${pointsForIncorrect}` : "0"} points (min 0)</p>
      </CardFooter>
    </Card>
  );
};
