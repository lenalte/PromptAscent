
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
  isReadOnly = false,
  id,
}) => {
  const getButtonText = () => {
    return isLastItem ? `Complete Stage` : 'Continue';
  };

  const getButtonIcon = () => {
    if (isLastItem) {
      return <Trophy className="mr-2 h-4 w-4" />;
    }
    return <ArrowRight className="ml-2 h-4 w-4" />;
  };

  useEffect(() => {
    if (!isReadOnly) {
        onAcknowledged();
    }
  }, [id, isReadOnly, onAcknowledged]);

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-blue-300 bg-blue-50 dark:bg-blue-900/20", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
          <Info className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300 pt-2 whitespace-pre-line">{content}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReadOnly && (
            <Button
                type="button"
                onClick={onAcknowledged}
                className={cn(
                    "w-full sm:w-auto bg-secondary hover:bg-secondary/90",
                    isLastItem && "bg-green-600 hover:bg-green-700"
                )}
            >
                {getButtonText()}
                {getButtonIcon()}
            </Button>
        )}
      </CardContent>
      <CardFooter className="flex justify-start text-xs text-blue-600 dark:text-blue-500 pt-4">
        <p>Points for reading: +{pointsAwarded}</p>
      </CardFooter>
    </Card>
  );
};
