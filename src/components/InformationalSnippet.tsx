
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InformationalSnippetProps {
  title: string;
  content: string;
  pointsAwarded: number;
  onAcknowledged: () => void; // Callback when the "Next" button is clicked
  isLastSnippet: boolean; // True if this is the final item in the lesson
}

export const InformationalSnippet: React.FC<InformationalSnippetProps> = ({
  title,
  content,
  pointsAwarded,
  onAcknowledged,
  isLastSnippet,
}) => {

    const handleButtonClick = () => {
        onAcknowledged(); // Trigger the acknowledgment and move to next
    };

  // Determine button text
  const getButtonText = () => {
    return isLastSnippet ? 'Lesson Complete' : 'Next';
  };

  // Determine button icon
  const getButtonIcon = () => {
    // No icon needed if it's the last snippet leading to completion screen
    if (!isLastSnippet) {
        return <ArrowRight className="ml-2 h-4 w-4" />;
    }
    return null;
  };

   // Determine if the button should be disabled (never for snippets unless it's the last one)
   const isButtonDisabled = isLastSnippet; // Only disable if it's the last one triggering completion

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">{title}</CardTitle>
        <CardDescription className="text-blue-700 pt-2">{content}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* No form needed, just displaying info */}
         <Button
             type="button"
             onClick={handleButtonClick}
             disabled={isButtonDisabled} // Button enabled unless it's the final item
             className={cn(
                 "w-full sm:w-auto bg-secondary hover:bg-secondary/90", // Use secondary color for 'Next' on info
                  isLastSnippet && "bg-green-600 hover:bg-green-700" // Different style for final completion button
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

