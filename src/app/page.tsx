
"use client"; 

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react'; 
import { PointsDisplay } from '@/components/PointsDisplay';
import { Separator } from '@/components/ui/separator';
import { useGlobalPoints } from '@/context/PointsContext';
import ProgressBar from '@/components/ui/progressbar';
import Sidebar from '@/components/ui/sidebarnew';
import LevelAndInformationBar from '@/components/LevelAndInformationBar';
import BirdsBackground from '@/components/BirdsBackground';


type LessonListing = Omit<Lesson, 'items'>;

export default function Home() {
  const { totalPoints } = useGlobalPoints();
  const [collapsed, setCollapsed] = React.useState(false); // Sidebar collapsed state
  const [lessonList, setLessonList] = useState<LessonListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      setIsLoading(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      }
      setIsLoading(false);
    }
    fetchLessons();
  }, []);

  // This function will be passed to the Sidebar to update the collapsed state in Home
  const handleToggleSidebar = (newCollapsedState: boolean) => {
    setCollapsed(newCollapsedState);
  };

  return (
    <>
      <BirdsBackground />
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-0 font-[family-name:var(--font-jetbrains-mono)]">
        <header>
          <ProgressBar progress={50} sidebarWidth={collapsed ? 80 : 256} />
          <LevelAndInformationBar sidebarWidth={collapsed ? 80 : 256} points={totalPoints} />
          <div
            className='flex justify-between pt-20'
          >
          </div>
        </header>

        <div className='flex flex-1 w-full'>
          {/* Pass onToggle which is setCollapsed to allow Sidebar to control Home's collapsed state */}
          <Sidebar onToggle={handleToggleSidebar} />

          <main
            className="flex-1 p-8 pb-2 gap-8 sm:p-0"
            style={{
              marginLeft: collapsed ? '80px' : '276px', // Adjusted margin for sidebar
              marginRight: '20px',
              transition: 'margin-left 0.3s ease-in-out',
            }}
          >
            <div className="w-full max-w-4xl text-left mb-8 mt-20">
              <h2 className="text-2xl font-semibold mb-2">Welcome to The Promptening!</h2>
              <p className="text-muted-foreground">
                Choose a lesson below to start learning and practicing prompt engineering. Your total score is shown above.
              </p>
            </div>

            {isLoading ? (
              <div className="w-full max-w-4xl text-center py-10">
                <p className="text-muted-foreground">Loading lessons...</p>
              </div>
            ) : lessonList.length === 0 ? (
                <div className="w-full max-w-4xl text-center py-10">
                    <p className="text-muted-foreground">No lessons available at the moment. Please check back later.</p>
                </div>
            ) : (
              <div className="w-full max-w-10xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonList.map((lesson) => (
                  <Card key={lesson.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
                    <CardHeader className="flex-grow">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-6 w-6 mr-3 text-primary" />
                        <CardTitle>{lesson.title}</CardTitle>
                      </div>
                      <CardDescription>{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end mt-auto pt-4">
                      <Link href={`/lesson/${lesson.id}`} passHref legacyBehavior>
                        <Button variant="default">
                          Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

    