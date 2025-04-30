
"use client";

import type React from 'react';
import { useState, useTransition } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { evaluatePrompt, type EvaluatePromptOutput } from '@/ai/flows/evaluate-prompt';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptEvaluatorProps {
  onEvaluationComplete?: (result: EvaluatePromptOutput) => void; // Optional callback
}

const formSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }),
  context: z.string().optional(),
});

type EvaluationResult = EvaluatePromptOutput & { attemptMade: boolean };

export const PromptEvaluator: React.FC<PromptEvaluatorProps> = ({ onEvaluationComplete }) => {
  const [isPending, startTransition] = useTransition();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult>({ score: 0, explanation: '', attemptMade: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      context: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setEvaluationResult({ score: 0, explanation: '', attemptMade: false }); // Reset previous result
    startTransition(async () => {
      try {
        const result = await evaluatePrompt({
          prompt: values.prompt,
          context: values.context,
        });
        setEvaluationResult({ ...result, attemptMade: true });
        onEvaluationComplete?.(result); // Call the callback if provided
      } catch (error) {
        console.error('Evaluation error:', error);
        setEvaluationResult({ score: 0, explanation: 'Error evaluating prompt. Please try again.', attemptMade: true });
      }
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Prompt Evaluator</CardTitle>
        <CardDescription>Enter a prompt and optional context to evaluate its effectiveness.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the prompt you want to evaluate..."
                      className="resize-y min-h-[100px]"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide any relevant context for the prompt..."
                      className="resize-y min-h-[80px]"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Context helps the AI understand the situation the prompt is intended for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {evaluationResult.attemptMade && (
              <Alert
                variant={evaluationResult.score > 0 ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
                  evaluationResult.score >= 70 ? "border-green-500" : evaluationResult.score >= 40 ? "border-yellow-500" : "border-destructive"
                )}
               >
                 {evaluationResult.score > 0 ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4 text-destructive" />}
                <AlertTitle>Evaluation Result</AlertTitle>
                <AlertDescription className="space-y-2">
                   <div>Score: {evaluationResult.score}/100</div>
                   <Progress value={evaluationResult.score} className="w-full h-2 [&>*]:bg-gradient-to-r [&>*]:from-red-500 [&>*]:via-yellow-500 [&>*]:to-green-500" />
                   <p className="pt-2">Explanation: {evaluationResult.explanation}</p>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...
                </>
              ) : (
                'Evaluate Prompt'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">Evaluation powered by AI. Scores and explanations are estimates.</p>
      </CardFooter>
    </Card>
  );
};
