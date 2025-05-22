
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useGlobalPoints } from '@/context/PointsContext';
import ProgressBar from '@/components/ui/progressbar';
import Sidebar from '@/components/ui/sidebarnew';
import LevelAndInformationBar from '@/components/LevelAndInformationBar';
import BirdsBackground from '@/components/BirdsBackground';


type LessonListing = Omit<Lesson, 'items'>;

export default function Home() {
  const { totalPoints } = useGlobalPoints();
  const [isSidebarContentAreaOpen, setIsSidebarContentAreaOpen] = useState(true);
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

  const handleSidebarContentToggle = useCallback((isOpen: boolean) => {
    setIsSidebarContentAreaOpen(isOpen);
  }, []);

  const ICON_BAR_WIDTH_PX = 80; // Corresponds to w-20
  const CONTENT_AREA_WIDTH_PX = 256; // Corresponds to w-64

  const currentSidebarTotalWidth = isSidebarContentAreaOpen
    ? ICON_BAR_WIDTH_PX + CONTENT_AREA_WIDTH_PX
    : ICON_BAR_WIDTH_PX;

  return (
    <>
      <BirdsBackground />
      <Sidebar initialContentOpen={isSidebarContentAreaOpen} onContentToggle={handleSidebarContentToggle} />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md"> {/* Added sticky and background for header */}
          <ProgressBar progress={50} sidebarWidth={0} /> {/* sidebarWidth is 0 because ProgressBar is inside the margin-adjusted div */}
          <LevelAndInformationBar className="mt-2" sidebarWidth={0} points={totalPoints} /> {/* Same for LevelAndInformationBar, added mt-2 */}
        </header>

        <main className="flex-1 p-8 pt-30"> {/* Adjusted pt-28 to pt-30 */}
          <div className="w-full max-w-4xl text-left mb-8">
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
    </>
  );
}
