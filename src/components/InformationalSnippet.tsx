"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Info, Trophy } from 'lucide-react'; // Added Info icon and Trophy
import { cn } from '@/lib/utils';

interface InformationalSnippetProps {
  title: string;
  content: string;
  pointsAwarded: number;
  onAcknowledged: () => void;
  isLastItem: boolean; // Renamed from isLastSnippet for consistency
  // Add other props passed from parent if needed for consistency, though may not be used directly
  id: number | string;
  isAnswerSubmitted: boolean; // Passed from parent, might indicate if 'Next' was clicked
  onNext: () => void; // Passed from parent, equivalent to onAcknowledged here
  lessonPoints: number; // Total points for the lesson so far
}

export const InformationalSnippet: React.FC<InformationalSnippetProps> = ({
  title,
  content,
  pointsAwarded,
  onAcknowledged,
  isLastItem,
  lessonPoints,
  // id, isAnswerSubmitted, onNext might not be used if parent handles logic
}) => {

  const handleButtonClick = () => {
    // Use onAcknowledged (mapped from onNext in parent)
    onAcknowledged();
  };

  // Determine button text
  const getButtonText = () => {
    return isLastItem ? `View Score (${lessonPoints} Points)` : 'Next';
  };

  // Determine button icon
  const getButtonIcon = () => {
    if (isLastItem) {
      return <Trophy className="mr-2 h-4 w-4" />;
    }
    return <ArrowRight className="ml-2 h-4 w-4" />;
  };

  // Determine if the button should be disabled (never for snippets until completion)
  // Snippets are simple, the button always just proceeds.
  // The parent handles the overall lesson completion state.
  const isButtonDisabled = false; // Button is always enabled for snippets

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg border-blue-300 bg-blue-50">
      {/* Title is handled by the parent page */}
      <CardHeader>
        {/* Use CardTitle for semantic structure, parent handles overall item title */}
        <CardTitle className="text-blue-800 flex items-center">
          <Info className="mr-2 h-5 w-5" /> Information
        </CardTitle>
        <CardDescription className="text-blue-700 pt-2">{content}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={isButtonDisabled}
          className={cn(
            "w-full sm:w-auto bg-secondary hover:bg-secondary/90",
            isLastItem && "bg-green-600 hover:bg-green-700"
          )}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-start text-xs text-blue-600 pt-4">
        <p>Points for reading: +{pointsAwarded}</p>
      </CardFooter>
    </Card>
  );
};
