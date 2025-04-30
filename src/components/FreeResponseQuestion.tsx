
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
import { CheckCircle2, XCircle, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreeResponseQuestionProps {
  question: string;
  expectedAnswer: string;
  pointsForCorrect: number;
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  isAnswerSubmitted: boolean; // New prop
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
  isAnswerSubmitted, // Use the new prop
}) => {
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: false, feedback: '', attemptMade: false });
  const [showHint, setShowHint] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAnswer: '',
    },
  });

   // Reset state when the question changes (primarily handled by key prop in parent, but good practice)
   useEffect(() => {
     form.reset();
     setValidationResult({ isValid: false, feedback: '', attemptMade: false });
     setShowHint(false);
   }, [question, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setValidationResult({ isValid: false, feedback: '', attemptMade: false }); // Reset previous result
    setShowHint(false); // Hide previous hints
    startTransition(async () => {
      try {
        const result = await validateUserAnswer({
          question,
          expectedAnswer,
          userAnswer: values.userAnswer,
        });
        setValidationResult({ ...result, attemptMade: true });
        onAnswerSubmit(result.isValid);
        if (!result.isValid) {
          // Optionally reset the form field on incorrect answer for retry
          // form.resetField("userAnswer");
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({ isValid: false, feedback: 'Error validating answer. Please try again.', attemptMade: true });
        onAnswerSubmit(false); // Consider error as incorrect
      }
    });
  };

  const toggleHint = () => setShowHint(prev => !prev);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      disabled={isAnswerSubmitted || isPending} // Disable textarea after submission
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {validationResult.attemptMade && (
              <Alert
                id="feedback-alert"
                variant={validationResult.isValid ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
                  validationResult.isValid ? "border-green-500 bg-green-50" : "border-destructive bg-red-50" // Added background colors for better distinction
                )}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertTitle className={cn(validationResult.isValid ? "text-green-800" : "text-red-800")}> {/* Adjusted title color */}
                    {validationResult.isValid ? 'Correct!' : 'Incorrect'}
                </AlertTitle>
                <AlertDescription className={cn(validationResult.isValid ? "text-green-700" : "text-red-700")}> {/* Adjusted description color */}
                  {validationResult.feedback}
                </AlertDescription>
                 {!validationResult.isValid && validationResult.feedback && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleHint}
                    className="mt-2 text-accent-foreground hover:bg-accent/80"
                    disabled={isPending}
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                 )}
                 {showHint && !validationResult.isValid && (
                   <p className="text-sm text-muted-foreground mt-2 p-2 border rounded bg-muted">
                     {/* Displaying feedback again as hint, or use a separate hint field if available */}
                     Hint: {validationResult.feedback}
                   </p>
                 )}
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isPending || isAnswerSubmitted} // Disable button if pending or already submitted
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating...
                </>
              ) : isAnswerSubmitted ? (
                 'Answer Submitted' // Change button text after submission
              ) : (
                'Submit Answer'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
           <p>Correct: +{pointsForCorrect} points</p>
           <p>Incorrect: -{pointsForIncorrect} points (min 0)</p>
       </CardFooter>
    </Card>
  );
};
