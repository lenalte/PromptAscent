
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
  id: number | string; // Unique ID of the question item
  // pointsAwarded is aliased as pointsForCorrect
  onNext: () => void; // Alias for onNextQuestion
  lessonPoints: number; // Total points for the lesson so far
}

const formSchema = z.object({
  selectedOption: z.string({ required_error: 'Please select an option.' }),
});

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  correctOptionIndex,
  pointsForCorrect, // This is the same as pointsAwarded for this item type
  pointsForIncorrect,
  onAnswerSubmit,
  isAnswerSubmitted,
  isLastItem,
  onNextQuestion,
  lessonPoints,
  // title, id are part of common props from parent
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedOption: undefined,
    },
  });

  useEffect(() => {
    form.reset({ selectedOption: undefined });
    setIsCorrect(null);
    setIsLoading(false);
  }, [question, form]);

  const handleButtonClick = () => {
    if (!isAnswerSubmitted) {
      form.handleSubmit(onSubmit)();
    } else {
      onNextQuestion();
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Potentially for a brief visual feedback
    const selectedIndex = parseInt(values.selectedOption, 10);
    const correct = selectedIndex === correctOptionIndex;

    setIsCorrect(correct);
    onAnswerSubmit(correct);

    setIsLoading(false);
  };

  const getButtonText = () => {
    if (isLoading) return 'Checking...'; // Though isLoading is brief here
    if (!isAnswerSubmitted) return 'Submit Answer';
    if (isLastItem) return `View Score (${lessonPoints} Points)`;
    return 'Next Question';
  };

  const getButtonIcon = () => {
    if (isLoading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    if (isAnswerSubmitted && isLastItem) return <Trophy className="mr-2 h-4 w-4" />;
    if (isAnswerSubmitted && !isLastItem) return <ArrowRight className="ml-2 h-4 w-4" />;
    return null;
  };

  const isButtonDisabled = isLoading || (isAnswerSubmitted && isLastItem && isCorrect === null);
  const isFormInvalidAndNotSubmitted = !form.formState.isValid && !isAnswerSubmitted;


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
              name="selectedOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose the best answer:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                      disabled={isAnswerSubmitted || isLoading}
                      aria-describedby={isAnswerSubmitted ? "feedback-alert" : undefined}
                    >
                      {options.map((option, index) => (
                        <FormItem key={index} className={cn(
                          "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                          isAnswerSubmitted && index === correctOptionIndex && "border-green-500 bg-green-50",
                          isAnswerSubmitted && index !== correctOptionIndex && parseInt(field.value) === index && "border-destructive bg-red-50",
                          !isAnswerSubmitted && "hover:bg-muted/50"
                        )}
                        >
                          <FormControl>
                            <RadioGroupItem value={index.toString()} disabled={isAnswerSubmitted || isLoading} />
                          </FormControl>
                          <FormLabel className={cn(
                            "font-normal cursor-pointer flex-1",
                            isAnswerSubmitted && index === correctOptionIndex && "text-green-800",
                            isAnswerSubmitted && index !== correctOptionIndex && parseInt(field.value) === index && "text-red-800"
                          )}>
                            {option}
                          </FormLabel>
                          {isAnswerSubmitted && index === correctOptionIndex && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {isAnswerSubmitted && index !== correctOptionIndex && parseInt(field.value) === index && <XCircle className="h-5 w-5 text-destructive" />}
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
              type="button"
              onClick={handleButtonClick}
              disabled={isButtonDisabled || isFormInvalidAndNotSubmitted}
              className={cn(
                "w-full sm:w-auto disabled:opacity-50",
                !isAnswerSubmitted ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90",
                isLastItem && isAnswerSubmitted && "bg-green-600 hover:bg-green-700"
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
        <p>Incorrect: {pointsForIncorrect > 0 ? `-${pointsForIncorrect}` : "0"} points (min 0)</p>
      </CardFooter>
    </Card>
  );
};
