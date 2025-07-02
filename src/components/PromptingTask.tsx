
"use client";

import type React from 'react';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { evaluatePrompt, type EvaluatePromptOutput } from '@/ai/flows/evaluate-prompt';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptingTaskProps {
  taskDescription: string;
  evaluationGuidance: string;
  pointsForCorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  title: string;
  id: number | string;
  isReadOnly?: boolean;
  isActive?: boolean;
  registerSubmit?: (fn: () => void) => void;
  unregisterSubmit?: () => void;
  onValidityChange?: (isValid: boolean) => void;
}

const formSchema = z.object({
  userPrompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }),
});

type EvaluationResultWithAttempt = EvaluatePromptOutput & { attemptMade: boolean };

export const PromptingTask: React.FC<PromptingTaskProps> = ({
  taskDescription,
  evaluationGuidance,
  pointsForCorrect,
  onAnswerSubmit,
  title,
  id,
  isReadOnly = false,
  isActive = false,
  registerSubmit,
  unregisterSubmit,
  onValidityChange,
}) => {
  const [isPending, startTransition] = useTransition();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultWithAttempt>({
    score: 0,
    explanation: '',
    isCorrect: false,
    attemptMade: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPrompt: '',
    },
  });

  const { handleSubmit, formState: { isValid } } = form;

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    if (isReadOnly || evaluationResult.attemptMade) return;
    setEvaluationResult({ score: 0, explanation: '', isCorrect: false, attemptMade: false });
    startTransition(async () => {
      try {
        const result = await evaluatePrompt({
          prompt: values.userPrompt,
          context: taskDescription,
          evaluationGuidance: evaluationGuidance,
        });
        setEvaluationResult({ ...result, attemptMade: true });
        onAnswerSubmit(result.isCorrect);
      } catch (error) {
        console.error('Prompt evaluation error:', error);
        setEvaluationResult({
          score: 0,
          explanation: 'Error evaluating prompt. Please try again.',
          isCorrect: false,
          attemptMade: true,
        });
        onAnswerSubmit(false);
      }
    });
  }, [isReadOnly, evaluationResult.attemptMade, taskDescription, evaluationGuidance, onAnswerSubmit, startTransition]);

  useEffect(() => {
    // Reset state when the question ID changes
    form.reset({ userPrompt: '' });
    setEvaluationResult({ score: 0, explanation: '', isCorrect: false, attemptMade: false });
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
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center">
          <FilePenLine className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-purple-700 dark:text-purple-400 pt-2 whitespace-pre-line">{taskDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-800 dark:text-purple-300">Your Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your prompt here to solve the task..."
                      className="resize-y min-h-[120px] bg-white dark:bg-background focus:border-purple-500 dark:focus:border-purple-400"
                      rows={6}
                      {...field}
                      aria-describedby={evaluationResult.attemptMade ? "feedback-alert" : undefined}
                      disabled={isReadOnly || isPending || evaluationResult.attemptMade}
                    />
                  </FormControl>
                  <FormDescription className="text-purple-600 dark:text-purple-500">
                    Craft a prompt based on the task description above.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPending && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    <span>Evaluating...</span>
                </div>
            )}

            {evaluationResult.attemptMade && (
              <Alert
                id="feedback-alert"
                variant={evaluationResult.isCorrect ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
                  evaluationResult.isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700" : "border-destructive bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                )}
              >
                {evaluationResult.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive dark:text-red-400" />
                )}
                <AlertTitle className={cn(evaluationResult.isCorrect ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>
                  {evaluationResult.isCorrect ? 'Effective Prompt!' : 'Needs Improvement'}
                </AlertTitle>
                <AlertDescription className={cn("space-y-2", evaluationResult.isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                  <div>Score: {evaluationResult.score}/100</div>
                  <Progress
                    value={evaluationResult.score}
                    className={cn(
                      "w-full h-2",
                      evaluationResult.score >= 70 ? "[&>*]:bg-green-500 dark:[&>*]:bg-green-400" : 
                      evaluationResult.score >= 40 ? "[&>*]:bg-yellow-500 dark:[&>*]:bg-yellow-400" : 
                      "[&>*]:bg-red-500 dark:[&>*]:bg-red-400"
                    )}
                  />
                  <p className="pt-2 whitespace-pre-line">Explanation: {evaluationResult.explanation}</p>
                </AlertDescription>
              </Alert>
            )}
            <div className="text-sm text-purple-700 dark:text-purple-400 mt-4 p-3 border border-purple-200 dark:border-purple-700 rounded-md bg-purple-100/50 dark:bg-purple-900/30">
              <h4 className="font-semibold mb-1 text-purple-800 dark:text-purple-300">Evaluation Guidance:</h4>
              <p className="whitespace-pre-line">{evaluationGuidance}</p>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-purple-600 dark:text-purple-500 pt-4">
        <p>Effective: +{pointsForCorrect} points</p>
        <p>Needs Improvement: 0 points (max 3 attempts)</p>
      </CardFooter>
    </Card>
  );
};
