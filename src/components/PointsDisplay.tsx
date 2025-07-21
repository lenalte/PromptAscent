"use client";

import type React from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PointsDisplayProps {
  points: number;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ points }) => {
  return (
    <Card className="w-fit shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Points</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{points}</div>
      </CardContent>
    </Card>
  );
};
