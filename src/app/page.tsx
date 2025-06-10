
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useGlobalPoints } from '@/context/PointsContext';
import ProgressBar from '@/components/ui/progressbar';
import Sidebar from '@/components/ui/sidebarnew';
import LevelAndInformationBar from '@/components/LevelAndInformationBar';
import BirdsBackground from '@/components/BirdsBackground';
import { EightbitButton } from '@/components/ui/eightbit-button';
import type { Level } from '@/data/level-structure'; // Import Level type
import { getLevelForLessonId } from '@/data/level-structure'; // Import function

type LessonListing = Omit<Lesson, 'items'>;

export default function Home() {
  const { totalPoints } = useGlobalPoints();
  const [isSidebarContentAreaOpen, setIsSidebarContentAreaOpen] = useState(true);
  const [lessonList, setLessonList] = useState<LessonListing[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonListing | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null); // State for current level

  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
        if (availableLessons.length > 0) {
          // If no lesson is selected yet, or selected lesson is not in the new list, select the first one
          if (!selectedLesson || !availableLessons.find(l => l.id === selectedLesson.id)) {
             const initialSelectedLesson = availableLessons[0];
             setSelectedLesson(initialSelectedLesson);
          }
        } else {
          setSelectedLesson(null); // No lessons available
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        setSelectedLesson(null);
      }
      setIsLoadingLessons(false);
    }
    fetchLessons();
  }, []); // Removed selectedLesson from dependency array to avoid re-fetching on selection

  // Effect to update currentLevel when selectedLesson changes
  useEffect(() => {
    if (selectedLesson) {
      const level = getLevelForLessonId(selectedLesson.id);
      setCurrentLevel(level || null);
    } else {
      setCurrentLevel(null);
    }
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
      <Sidebar
        initialContentOpen={isSidebarContentAreaOpen}
        onContentToggle={handleSidebarContentToggle}
        onLessonSelect={handleLessonSelect}
        currentSelectedLessonId={selectedLesson?.id}
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <ProgressBar progress={50} sidebarWidth={0} />
          <LevelAndInformationBar
            className="mt-2"
            sidebarWidth={0}
            totalPoints={totalPoints}
            currentLevel={currentLevel} // Pass currentLevel
          />
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
                <EightbitButton>
                  Start Lesson <ArrowRight className="ml-2 h-5 w-5" />
                </EightbitButton>
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-4xl text-center py-10">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to The Promptening!</h2>
              <p className="text-muted-foreground">
                No lessons available at the moment, or an error occurred. Please check back later or select a lesson from the sidebar if available.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
