
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons';
/* import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; */
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
/* import { Separator } from '@/components/ui/separator'; */
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
  /* const [isLoading, setIsLoading] = useState(true); */
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonListing | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
        if (availableLessons.length > 0 && !selectedLesson) {
          setSelectedLesson(availableLessons[0]); // Set the first lesson as selected by default
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      }
      setIsLoadingLessons(false);
    }
    fetchLessons();
  }, [selectedLesson]);

  const handleSidebarContentToggle = useCallback((isOpen: boolean) => {
    setIsSidebarContentAreaOpen(isOpen);
  }, []);

  const handleLessonSelect = useCallback((lesson: LessonListing) => {
    setSelectedLesson(lesson);
  }, []);

  const ICON_BAR_WIDTH_PX = 64; // w-16 (4rem)
  const CONTENT_AREA_WIDTH_PX = 256; // w-64 (16rem)

  const currentSidebarTotalWidth = isSidebarContentAreaOpen
    ? ICON_BAR_WIDTH_PX + CONTENT_AREA_WIDTH_PX
    : ICON_BAR_WIDTH_PX;

  return (
    <>
      <BirdsBackground />
      {/* <Sidebar initialContentOpen={isSidebarContentAreaOpen} onContentToggle={handleSidebarContentToggle} /> */}
      <Sidebar
        initialContentOpen={isSidebarContentAreaOpen}
        onContentToggle={handleSidebarContentToggle}
        onLessonSelect={handleLessonSelect} // Pass the new handler
        currentSelectedLessonId={selectedLesson?.id} // Pass current selected ID for highlighting
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <ProgressBar progress={50} sidebarWidth={0} />
          <LevelAndInformationBar className="mt-2" sidebarWidth={0} points={totalPoints} />
        </header>

        <main className="flex-1 p-8 pt-30">
          {isLoadingLessons ? (
            <div className="w-full max-w-4xl text-center py-10 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading lessons...</p>
            </div>
          ) : selectedLesson ? (
            <div className="w-full max-w-4xl text-left mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">{selectedLesson.title}</h2>
              <p className="text-muted-foreground mb-6 text-lg">{selectedLesson.description}</p>
              <Link href={`/lesson/${selectedLesson.id}`} passHref legacyBehavior>
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-[hsl(0,81%,28%)] hover:text-foreground"
                >
                  Start Lesson <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-4xl text-center py-10">
              <h2 className="text-2xl font-semibold mb-2">Welcome to The Promptening!</h2>
              <p className="text-muted-foreground">
                No lessons available at the moment, or an error occurred. Please check back later or select a lesson from the sidebar if available.
              </p>
            </div>
          )}

          {/* The lesson card grid is now removed */}
        </main>
      </div>
    </>
  );
}
