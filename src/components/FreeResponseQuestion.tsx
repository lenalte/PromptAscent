
"use client";

import type React from 'react';
import { useState, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { validateUserAnswer, type ValidateUserAnswerOutput } from '@/ai/flows/validate-user-answer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Lightbulb, ArrowRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

// props
interface FreeResponseQuestionProps {
  question: string;
  expectedAnswer: string;
  pointsForCorrect: number;
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  isLastItem: boolean;
  onNextQuestion: () => void;
  title: string;
  id: number | string;
  lessonPoints: number;
  isReadOnly?: boolean;
}

const formSchema = z.object({
  userAnswer: z.string().min(1, { message: 'Please enter an answer.' }),
});

type ValidationResult = ValidateUserAnswerOutput & { attemptMade: boolean };

export const FreeResponseQuestion: React.FC<FreeResponseQuestionProps> = ({
  question,
  expectedAnswer,
  pointsForCorrect,
  pointsForIncorrect,
  onAnswerSubmit,
  isLastItem,
  onNextQuestion,
  lessonPoints,
  title,
  id,
  isReadOnly = false,
}) => {
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: false, feedback: '', attemptMade: false });
  const [isClientMounted, setIsClientMounted] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAnswer: '',
    },
  });

  useEffect(() => {
    setIsClientMounted(true);
    // Reset feedback when question id and its instance (via key) changes
    setValidationResult({ isValid: false, feedback: '', attemptMade: false });
    form.reset({ userAnswer: '' });
  }, [id, form]);

  const handleButtonClick = () => {
    if (!validationResult.attemptMade) {
      form.handleSubmit(onSubmit)();
    } else {
      onNextQuestion();
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setValidationResult({ isValid: false, feedback: '', attemptMade: false });
    startTransition(async () => {
      try {
        const result = await validateUserAnswer({
          question,
          expectedAnswer,
          userAnswer: values.userAnswer,
        });
        setValidationResult({ ...result, attemptMade: true });
        onAnswerSubmit(result.isValid);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({ isValid: false, feedback: 'Error validating answer. Please try again.', attemptMade: true });
        onAnswerSubmit(false);
      }
    });
  };

  const getButtonText = () => {
    if (isPending) return 'Validating...';
    if (!validationResult.attemptMade) return 'Submit Answer';
    return isLastItem ? `Complete Stage` : 'Next';
  };
  
  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle> 
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="userAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your answer here..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      aria-describedby={validationResult.attemptMade ? "feedback-alert" : undefined}
                      disabled={isReadOnly || isPending || validationResult.attemptMade}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isClientMounted && validationResult.attemptMade && (
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
            
            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={isReadOnly || isPending || (!validationResult.attemptMade && !form.formState.isValid)}
              className={cn(
                "w-full sm:w-auto disabled:opacity-50",
                !validationResult.attemptMade ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90",
                isLastItem && validationResult.attemptMade && "bg-green-600 hover:bg-green-700"
              )}
            >
              <span className="flex items-center justify-center">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isPending && validationResult.attemptMade && isLastItem && <Trophy className="mr-2 h-4 w-4" />}
                {getButtonText()}
                {!isPending && validationResult.attemptMade && !isLastItem && <ArrowRight className="ml-2 h-4 w-4" />}
              </span>
            </Button>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
        <p>Correct: +{pointsForCorrect} points</p>
        <p>Incorrect: {pointsForIncorrect > 0 ? `-${pointsForIncorrect}` : "0"} points (max 3 attempts)</p>
      </CardFooter>
    </Card>
  );
};
