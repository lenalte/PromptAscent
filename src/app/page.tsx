
"use client";

import React from 'react';
import Link from 'next/link';
import { lessons } from '@/data/lessons'; // Import lesson data
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Separator } from '@/components/ui/separator';
import { useGlobalPoints } from '@/context/PointsContext'; // Import the global points hook
import ProgressBar from '@/components/ui/progressbar'; // Import the ProgressBar component
import Sidebar from '@/components/ui/sidebarnew'; // Import the Sidebar component
import LevelAndInformationBar from '@/components/LevelAndInformationBar';

export default function Home() {
  const { totalPoints } = useGlobalPoints(); // Get total points from global context
  const [collapsed, setCollabsed] = React.useState(false);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-0 font-[family-name:var(--font-jetbrains-mono)]">
      <header>
        <ProgressBar progress={50} sidebarWidth={collapsed ? 80 : 256} />
        <LevelAndInformationBar sidebarWidth={collapsed ? 80 : 256} points={totalPoints} />
        <div
          className='flex justify-between pt-20'
        /* style={{
          marginLeft: collapsed ? '80px' : '256px', // Adjust the main content margin based on the sidebar state
          transition: 'margin-left 0.3s ease-in-out', // Smooth transition for margin
        }} */
        >
          {/* <LevelsAndPoints level={1} points={totalPoints} sidebarWidth={collapsed ? 80 : 256} /> */}
        </div>
      </header>

      <div className='flex flex-1'>
        <Sidebar onToggle={setCollabsed} />

        <main
          className="flex-1 p-8 pb-20 gap-16 sm:p-0 grid grid-rows-[20px_1fr_20px] items-center justify-items-center"
          style={{
            marginLeft: collapsed ? '80px' : '256px', // Adjust the main content margin based on the sidebar state
            transition: 'margin-left 0.3s ease-in-out', // Smooth transition for margin
          }}
        >

          <div className="w-full max-w-4xl text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
            <p className="text-muted-foreground">
              Choose a lesson below to start learning and practicing prompt engineering. Your total score is shown above.
            </p>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <Link href={`/lesson/${lesson.id}`} passHref legacyBehavior>
                    <Button variant="default">
                      Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

