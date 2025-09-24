
"use client";

import type React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
  isReadOnly = false,
}) => {
  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-lg rounded-lg border-blue-300 bg-blue-50 dark:bg-blue-900/20", isReadOnly && "bg-muted/50")}>
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 dark:text-blue-200 flex items-center">
          <InfoIcon className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300 pt-2 whitespace-pre-line">{content}</CardDescription>
      </CardHeader>
    </Card>
  );
};
