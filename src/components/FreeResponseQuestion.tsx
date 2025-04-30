
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
import { CheckCircle2, XCircle, Loader2, Lightbulb, ArrowRight } from 'lucide-react'; // Added ArrowRight
import { cn } from '@/lib/utils';

interface FreeResponseQuestionProps {
  question: string;
  expectedAnswer: string;
  pointsForCorrect: number;
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  isAnswerSubmitted: boolean;
  isLastQuestion: boolean; // New prop
  onNextQuestion: () => void; // New prop
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
  isAnswerSubmitted,
  isLastQuestion, // Use the new prop
  onNextQuestion, // Use the new prop
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

   // Reset form and validation state when the question changes
   useEffect(() => {
     form.reset({ userAnswer: '' }); // Explicitly reset userAnswer
     setValidationResult({ isValid: false, feedback: '', attemptMade: false });
     setShowHint(false);
   }, [question, form]); // Depend on question and form instance

  const handleButtonClick = () => {
      if (!isAnswerSubmitted) {
          form.handleSubmit(onSubmit)();
      } else if (!isLastQuestion) {
          onNextQuestion();
      }
      // If it's the last question and submitted, the button will be disabled
  };

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
        // Don't reset form field here, user might want to see their answer
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({ isValid: false, feedback: 'Error validating answer. Please try again.', attemptMade: true });
        onAnswerSubmit(false); // Consider error as incorrect
      }
    });
  };

  const toggleHint = () => setShowHint(prev => !prev);

  const getButtonText = () => {
    if (isPending) return 'Validating...';
    if (!isAnswerSubmitted) return 'Submit Answer';
    if (!isLastQuestion) return 'Next Question';
    return 'Answer Submitted'; // Text for last question after submission
  };

  const getButtonIcon = () => {
    if (isPending) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    if (isAnswerSubmitted && !isLastQuestion) return <ArrowRight className="ml-2 h-4 w-4" />;
    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* Removed the form element, handle submission via button click */}
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
                      disabled={isAnswerSubmitted || isPending} // Disable textarea after submission or during validation
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
                  validationResult.isValid ? "border-green-500 bg-green-50" : "border-destructive bg-red-50"
                )}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertTitle className={cn(validationResult.isValid ? "text-green-800" : "text-red-800")}>
                    {validationResult.isValid ? 'Correct!' : 'Incorrect'}
                </AlertTitle>
                <AlertDescription className={cn(validationResult.isValid ? "text-green-700" : "text-red-700")}>
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
                     Hint: {validationResult.feedback}
                   </p>
                 )}
              </Alert>
            )}

            <Button
              type="button" // Change type to button
              onClick={handleButtonClick} // Use the new handler
              disabled={isPending || (isAnswerSubmitted && isLastQuestion)} // Disable if pending or last question submitted
              className={cn(
                "w-full sm:w-auto disabled:opacity-50",
                !isAnswerSubmitted ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"
              )}
            >
              {getButtonIcon()}
              {getButtonText()}
            </Button>
          </div>
        </Form>
      </CardContent>
       <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
           <p>Correct: +{pointsForCorrect} points</p>
           <p>Incorrect: -{pointsForIncorrect} points (min 0)</p>
       </CardFooter>
    </Card>
  );
};
