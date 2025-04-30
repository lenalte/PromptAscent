
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Info } from 'lucide-react'; // Added Info icon
import { cn } from '@/lib/utils';

interface InformationalSnippetProps {
  title: string;
  content: string;
  pointsAwarded: number;
  onAcknowledged: () => void;
  isLastSnippet: boolean; // Directly use the prop passed from parent (page.tsx maps isLastItem -> isLastSnippet)
  // Add other props passed from parent if needed for consistency, though may not be used directly
  id: number;
  isAnswerSubmitted: boolean; // Passed from parent, might indicate if 'Next' was clicked
  onNext: () => void; // Passed from parent, equivalent to onAcknowledged here
}

export const InformationalSnippet: React.FC<InformationalSnippetProps> = ({
  title,
  content,
  pointsAwarded,
  onAcknowledged,
  isLastSnippet, // Use the passed prop directly
  // id, isAnswerSubmitted, onNext might not be used if parent handles logic
}) => {

    const handleButtonClick = () => {
        // Use onAcknowledged (mapped from onNext in parent)
        onAcknowledged();
    };

  // Determine button text
  const getButtonText = () => {
    // If it's the last completed item in the queue
    return isLastSnippet ? 'Lesson Complete' : 'Next';
  };

  // Determine button icon
  const getButtonIcon = () => {
    // No icon needed if it's the last snippet leading to completion screen
    if (!isLastSnippet) {
        return <ArrowRight className="ml-2 h-4 w-4" />;
    }
     // Optional: Check icon for the final complete button
     return <CheckCircle className="ml-2 h-4 w-4" />;
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
                 // Special style if it's the final completion button
                 isLastSnippet && "bg-green-600 hover:bg-green-700"
             )}
           >
             {getButtonText()}
             {getButtonIcon()}
           </Button>
      </CardContent>
       <CardFooter className="flex justify-start text-xs text-blue-600 pt-4">
           <p>Points for reading: +{pointsAwarded}</p>
       </CardFooter>
    </Card>
  );
};
