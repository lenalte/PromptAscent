
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
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react'; // Added Loader2
import { cn } from '@/lib/utils';

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctOptionIndex: number;
  pointsForCorrect: number; // Renamed from pointsAwarded in page.tsx for clarity here
  pointsForIncorrect: number;
  onAnswerSubmit: (isCorrect: boolean) => void; // Called when the choice is submitted
  isAnswerSubmitted: boolean; // Whether the current attempt on this component instance has been submitted.
  isLastQuestion: boolean; // True ONLY if this is the final question instance AND it was previously answered correctly.
  onNextQuestion: () => void; // Called when the "Next" button is clicked
}

const formSchema = z.object({
  selectedOption: z.string({ required_error: 'Please select an option.' }), // Ensure an option is selected
});

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  correctOptionIndex,
  pointsForCorrect,
  pointsForIncorrect,
  onAnswerSubmit,
  isAnswerSubmitted, // Tracks the submission state *for this specific render/attempt*
  isLastQuestion,
  onNextQuestion,
}) => {
  // Internal state for correctness *of the current attempt*
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For potential async operations if needed

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedOption: undefined, // Start with no selection
    },
  });

  // Reset internal component state when the `question` prop changes.
   useEffect(() => {
     form.reset({ selectedOption: undefined }); // Clear the selection
     setIsCorrect(null); // Clear correctness state for the new attempt
     setIsLoading(false);
   }, [question, form]); // Re-run when the question text changes


  // Handles the primary button click
  const handleButtonClick = () => {
      if (!isAnswerSubmitted) { // If the current attempt hasn't been submitted yet
          form.handleSubmit(onSubmit)(); // Trigger validation and submission
      } else { // If the current attempt *has* been submitted
          if (!isLastQuestion) {
            onNextQuestion();
          }
          // If it IS the last question, the button will be disabled (logic below)
      }
  };

  // Function called by react-hook-form on successful form validation (option selected)
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Indicate processing start (optional, instant for MC)
    const selectedIndex = parseInt(values.selectedOption, 10); // Radio value is the index as string
    const correct = selectedIndex === correctOptionIndex;

    setIsCorrect(correct);
    onAnswerSubmit(correct); // Inform parent

    setIsLoading(false); // Indicate processing end
  };

  // Determine button text based on the state
   const getButtonText = () => {
     if (isLoading) return 'Checking...';
     if (!isAnswerSubmitted) return 'Submit Answer';
     if (!isLastQuestion) return 'Next Question';
     return 'Lesson Complete';
   };

   // Determine which icon to show on the button
   const getButtonIcon = () => {
     if (isLoading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
     if (isAnswerSubmitted && !isLastQuestion) return <ArrowRight className="ml-2 h-4 w-4" />;
     return null;
   };

   // Determine if the button should be disabled
   const isButtonDisabled = isLoading || (isLastQuestion && isAnswerSubmitted);
    // Also disable if form is invalid (no selection) and hasn't been submitted yet
   const isFormInvalidAndNotSubmitted = !form.formState.isValid && !isAnswerSubmitted;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6"> {/* Wrap form content in a div for consistent spacing */}
            <FormField
              control={form.control}
              name="selectedOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose the best answer:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value} // Use controlled value
                      className="flex flex-col space-y-2"
                      disabled={isAnswerSubmitted || isLoading} // Disable after submitting or during load
                      aria-describedby={isAnswerSubmitted ? "feedback-alert" : undefined}
                    >
                      {options.map((option, index) => (
                        <FormItem key={index} className={cn(
                          "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                          isAnswerSubmitted && index === correctOptionIndex && "border-green-500 bg-green-50", // Highlight correct on submit
                          isAnswerSubmitted && index !== correctOptionIndex && parseInt(field.value) === index && "border-destructive bg-red-50", // Highlight incorrect selection
                          !isAnswerSubmitted && "hover:bg-muted/50" // Hover effect before submit
                          )}
                          >
                          <FormControl>
                            <RadioGroupItem value={index.toString()} disabled={isAnswerSubmitted || isLoading}/>
                          </FormControl>
                          <FormLabel className={cn(
                            "font-normal cursor-pointer flex-1",
                             isAnswerSubmitted && index === correctOptionIndex && "text-green-800",
                             isAnswerSubmitted && index !== correctOptionIndex && parseInt(field.value) === index && "text-red-800"
                           )}>
                            {option}
                          </FormLabel>
                           {/* Show check/x icons after submission */}
                           {isAnswerSubmitted && index === correctOptionIndex && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                           {isAnswerSubmitted && index !== correctOptionIndex && parseInt(field.value) === index && <XCircle className="h-5 w-5 text-destructive" />}
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage /> {/* Show error if no option selected */}
                </FormItem>
              )}
            />

            {/* Display overall feedback after submission */}
            {isAnswerSubmitted && isCorrect !== null && (
              <Alert
                id="feedback-alert"
                variant={isCorrect ? 'default' : 'destructive'}
                className={cn(
                  "transition-opacity duration-300 ease-in-out",
                  isCorrect ? "border-green-500 bg-green-50" : "border-destructive bg-red-50"
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertTitle className={cn(isCorrect ? "text-green-800" : "text-red-800")}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </AlertTitle>
                <AlertDescription className={cn(isCorrect ? "text-green-700" : "text-red-700")}>
                  {isCorrect
                    ? 'Well done!'
                    : `The correct answer was: "${options[correctOptionIndex]}"`}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button" // Changed to button to prevent default form submission, onClick handles logic
              onClick={handleButtonClick}
              disabled={isButtonDisabled || isFormInvalidAndNotSubmitted}
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

