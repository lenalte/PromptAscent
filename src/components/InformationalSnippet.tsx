
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Info, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface InformationalSnippetProps {
  title: string;
  content: string;
  pointsAwarded: number;
  onAcknowledged: () => void;
  isLastItem: boolean;
  id: number | string;
  isAnswerSubmitted: boolean;
  onNext: () => void;
  lessonPoints: number;
  isReadOnly?: boolean;
}

export const InformationalSnippet: React.FC<InformationalSnippetProps> = ({
  title,
  content,
  pointsAwarded,
  onAcknowledged,
  isLastItem,
  lessonPoints,
  isReadOnly = false,
  id,
}) => {
  // Automatically "acknowledge" the snippet when it becomes read-only (i.e., not active anymore)
  // or on first mount if it's already not the active item.
  useEffect(() => {
    if (!isReadOnly) {
        onAcknowledged();
    }
  }, [id, isReadOnly, onAcknowledged]);

  const getButtonText = () => {
    return isLastItem ? `Complete Stage` : 'Next';
  };

  const getButtonIcon = () => {
    if (isLastItem) {
      return <Trophy className="mr-2 h-4 w-4" />;
    }
    return <ArrowRight className="ml-2 h-4 w-4" />;
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto shadow-lg rounded-lg border-blue-300 bg-blue-50", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <Info className="mr-2 h-5 w-5" /> Information
        </CardTitle>
        <CardDescription className="text-blue-700 pt-2">{content}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* The button is only shown for the active snippet */}
        {!isReadOnly && (
            <Button
                type="button"
                onClick={onAcknowledged}
                className={cn(
                    "w-full sm:w-auto bg-secondary hover:bg-secondary/90",
                    isLastItem && "bg-green-600 hover:bg-green-700"
                )}
            >
                {getButtonIcon()}
                {getButtonText()}
            </Button>
        )}
      </CardContent>
      <CardFooter className="flex justify-start text-xs text-blue-600 pt-4">
        <p>Points for reading: +{pointsAwarded}</p>
      </CardFooter>
    </Card>
  );
};
