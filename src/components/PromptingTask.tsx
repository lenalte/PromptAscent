
"use client";

import type React from 'react';
import { useState, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { evaluatePrompt, type EvaluatePromptOutput } from '@/ai/flows/evaluate-prompt';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Lightbulb, ArrowRight, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptingTaskProps {
  taskDescription: string;
  evaluationGuidance: string; // Specific guidance for AI evaluation of THIS task
  pointsForCorrect: number;
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  isAnswerSubmitted: boolean;
  isLastTask: boolean;
  onNextTask: () => void;
  title: string;
  id: number;
  pointsAwarded: number; // Alias for pointsForCorrect
  onNext: () => void; // Alias for onNextTask
}

const formSchema = z.object({
  userPrompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }),
});

type EvaluationResultWithAttempt = EvaluatePromptOutput & { attemptMade: boolean };

export const PromptingTask: React.FC<PromptingTaskProps> = ({
  taskDescription,
  evaluationGuidance,
  pointsForCorrect,
  pointsForIncorrect,
  onAnswerSubmit,
  isAnswerSubmitted,
  isLastTask,
  onNextTask,
  title, // Passed for CardTitle, though parent also displays item title
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

  useEffect(() => {
    form.reset({ userPrompt: '' });
    setEvaluationResult({ score: 0, explanation: '', isCorrect: false, attemptMade: false });
  }, [taskDescription, form]);

  const handleButtonClick = () => {
    if (!isAnswerSubmitted) {
      form.handleSubmit(onSubmit)();
    } else {
      onNextTask();
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setEvaluationResult({ score: 0, explanation: '', isCorrect: false, attemptMade: false });
    startTransition(async () => {
      try {
        const result = await evaluatePrompt({
          prompt: values.userPrompt,
          context: taskDescription, // The task description serves as context for evaluation
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
  };

  const getButtonText = () => {
    if (isPending) return 'Evaluating...';
    if (!isAnswerSubmitted) return 'Submit Prompt';
    return isLastTask ? 'Lesson Complete' : 'Next Task';
  };

  const getButtonIcon = () => {
    if (isPending) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    if (isAnswerSubmitted && !isLastTask) return <ArrowRight className="ml-2 h-4 w-4" />;
    if (isAnswerSubmitted && isLastTask) return <CheckCircle2 className="ml-2 h-4 w-4" />;
    return null;
  };

  const isButtonDisabled = isPending || (isLastTask && isAnswerSubmitted);
  const isFormInvalidAndNotSubmitted = !form.formState.isValid && !isAnswerSubmitted;

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-lg border-purple-300 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-800 flex items-center">
            <FilePenLine className="mr-2 h-5 w-5" /> Prompting Task
        </CardTitle>
        <CardDescription className="text-purple-700 pt-2">{taskDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-800">Your Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your prompt here to solve the task..."
                      className="resize-y min-h-[120px] bg-white focus:border-purple-500"
                      rows={6}
                      {...field}
                      aria-describedby={evaluationResult.attemptMade ? "feedback-alert" : undefined}
                      disabled={isPending || isAnswerSubmitted}
                    />
                  </FormControl>
                  <FormDescription className="text-purple-600">
                    Craft a prompt based on the task description above.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {evaluationResult.attemptMade && (
              <Alert
                id="feedback-alert"
                variant={evaluationResult.isCorrect ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
                  evaluationResult.isCorrect ? "border-green-500 bg-green-50" : "border-destructive bg-red-50"
                )}
              >
                {evaluationResult.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertTitle className={cn(evaluationResult.isCorrect ? "text-green-800" : "text-red-800")}>
                  {evaluationResult.isCorrect ? 'Effective Prompt!' : 'Needs Improvement'}
                </AlertTitle>
                <AlertDescription className={cn("space-y-2", evaluationResult.isCorrect ? "text-green-700" : "text-red-700")}>
                  <div>Score: {evaluationResult.score}/100</div>
                  <Progress 
                    value={evaluationResult.score} 
                    className={cn(
                        "w-full h-2",
                        evaluationResult.score >= 70 ? "[&>*]:bg-green-500" : evaluationResult.score >= 40 ? "[&>*]:bg-yellow-500" : "[&>*]:bg-red-500"
                    )}
                  />
                  <p className="pt-2">Explanation: {evaluationResult.explanation}</p>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={isButtonDisabled || isFormInvalidAndNotSubmitted}
              className={cn(
                "w-full sm:w-auto disabled:opacity-50",
                !isAnswerSubmitted ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
                isLastTask && isAnswerSubmitted && "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {getButtonIcon()}
              {getButtonText()}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-purple-600 pt-4">
        <p>Effective: +{pointsForCorrect} points</p>
        <p>Needs Improvement: -{pointsForIncorrect} points (min 0)</p>
      </CardFooter>
    </Card>
  );
};

