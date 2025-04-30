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
import { CheckCircle2, XCircle, Loader2, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreeResponseQuestionProps {
  question: string;
  expectedAnswer: string;
  pointsForCorrect: number;
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
  isAnswerSubmitted: boolean; // Whether the *current attempt* on this component instance has been submitted.
  isLastQuestion: boolean; // True ONLY if this is the final question instance AND it was previously answered correctly.
  onNextQuestion: () => void;
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
  isAnswerSubmitted, // Tracks the submission state *for this specific render/attempt*
  isLastQuestion,     // True only for the final state after all questions are correctly answered
  onNextQuestion,
}) => {
  const [isPending, startTransition] = useTransition();
  // Internal state for validation feedback *of the current attempt*
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: false, feedback: '', attemptMade: false });
  const [showHint, setShowHint] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAnswer: '',
    },
  });

   // Reset internal component state when the `question` prop changes.
   // This is crucial for when a question reappears after being answered incorrectly.
   useEffect(() => {
     form.reset({ userAnswer: '' }); // Clear the input field
     setValidationResult({ isValid: false, feedback: '', attemptMade: false }); // Clear validation results for the new attempt
     setShowHint(false); // Hide any previous hints
   }, [question, form]); // Re-run when the question text changes

  // Handles the primary button click
  const handleButtonClick = () => {
      if (!isAnswerSubmitted) { // If the current attempt hasn't been submitted yet
          form.handleSubmit(onSubmit)(); // Trigger validation and submission
      } else { // If the current attempt *has* been submitted
          // Only trigger 'Next Question' if it's NOT the absolute final question state
          if (!isLastQuestion) {
            onNextQuestion();
          }
          // If it IS the last question, the button will be disabled (logic below), so nothing happens here.
      }
  };

  // Function called by react-hook-form on successful form validation (just checks non-empty)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Reset validation feedback specifically for this new submission attempt
    setValidationResult({ isValid: false, feedback: '', attemptMade: false });
    setShowHint(false);
    startTransition(async () => {
      try {
        const result = await validateUserAnswer({
          question,
          expectedAnswer,
          userAnswer: values.userAnswer,
        });
        // Update internal validation state to display feedback
        setValidationResult({ ...result, attemptMade: true });
        // Inform the parent component (page.tsx) about the correctness
        onAnswerSubmit(result.isValid);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({ isValid: false, feedback: 'Error validating answer. Please try again.', attemptMade: true });
        onAnswerSubmit(false); // Treat errors as incorrect
      }
    });
  };

  // Toggles the visibility of the hint
  const toggleHint = () => setShowHint(prev => !prev);

  // Determine button text based on the state of the current attempt and overall lesson progress
  const getButtonText = () => {
    if (isPending) return 'Validating...';
    if (!isAnswerSubmitted) return 'Submit Answer'; // Not yet submitted this attempt
    if (!isLastQuestion) return 'Next Question'; // Submitted this attempt, more questions to come
    return 'Lesson Complete'; // Submitted this attempt, and it's the final one
  };

  // Determine which icon to show on the button
  const getButtonIcon = () => {
    if (isPending) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    // Show arrow only if submitted *and* it's not the final question
    if (isAnswerSubmitted && !isLastQuestion) return <ArrowRight className="ml-2 h-4 w-4" />;
    return null;
  };

  // Determine if the button should be disabled
  // Disabled if:
  // 1. Validation is in progress (pending).
  // 2. Or, if this is the designated "last question" (meaning all unique questions are correct)
  //    AND the current attempt on *this* component instance has been submitted.
  const isButtonDisabled = isPending || (isLastQuestion && isAnswerSubmitted);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Question</CardTitle>
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
                      // Disable textarea during validation or after submitting *this attempt*
                      disabled={isPending || isAnswerSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display validation result only after *this attempt* is made */}
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
                 {/* Show hint button only if incorrect *in this attempt* and feedback exists */}
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
                 {/* Show hint text if toggled and incorrect *in this attempt* */}
                 {showHint && !validationResult.isValid && (
                   <p className="text-sm text-muted-foreground mt-2 p-2 border rounded bg-muted">
                     Hint: {validationResult.feedback}
                   </p>
                 )}
              </Alert>
            )}

            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={isButtonDisabled} // Use the calculated disabled state
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