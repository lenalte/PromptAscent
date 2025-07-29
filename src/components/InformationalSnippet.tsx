
"use client";

import type React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { InfoIcon } from './icons/InfoIcon';

interface InformationalSnippetProps {
  title: string;
  content: string;
  pointsAwarded: number;
  id: number | string;
  isReadOnly?: boolean;
}

export const InformationalSnippet: React.FC<InformationalSnippetProps> = ({
  title,
  content,
  pointsAwarded,
  isReadOnly = false,
}) => {
  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-blue-300 bg-blue-50 dark:bg-blue-900/20", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
          <InfoIcon className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300 pt-2 whitespace-pre-line">{content}</CardDescription>
      </CardHeader>
      {/* <CardFooter className="flex justify-start text-xs text-blue-600 dark:text-blue-500 pt-4">
        <p>Points for reading: +{pointsAwarded}</p>
      </CardFooter> */}
    </Card>
  );
};
