
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Trophy } from 'lucide-react';

interface LessonCompleteScreenProps {
  points: number;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ points }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg text-center border-green-500 bg-green-50">
      <CardHeader className="items-center">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
        <CardTitle className="text-2xl font-bold text-green-800">Lesson Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-green-700">
          Congratulations! You've successfully answered all the questions.
        </p>
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <p className="text-xl font-semibold text-foreground">
            Your final score: <span className="font-bold text-primary">{points}</span> points
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
