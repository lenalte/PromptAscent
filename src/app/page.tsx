
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import ProgressBar from '@/components/ui/progressbar';
import Sidebar from '@/components/ui/sidebarnew';
import LevelAndInformationBar from '@/components/LevelAndInformationBar';
import BirdsBackground from '@/components/BirdsBackground';
import { EightbitButton } from '@/components/ui/eightbit-button';
import type { Level } from '@/data/level-structure';
import { getLevelForLessonId, LEVELS } from '@/data/level-structure';

type LessonListing = Omit<Lesson, 'items'>;

export default function Home() {
  const { userProgress, currentUser, isLoadingAuth } = useUserProgress();
  const totalPoints = userProgress?.totalPoints ?? 0;
  const currentLessonIdForSidebar = userProgress?.currentLessonId ?? null;
  const unlockedLessonsForSidebar = userProgress?.unlockedLessons ?? [];

  const [isSidebarContentAreaOpen, setIsSidebarContentAreaOpen] = useState(true);
  const [lessonList, setLessonList] = useState<LessonListing[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonListing | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [levelProgressPercentage, setLevelProgressPercentage] = useState(0);

  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
        if (availableLessons.length > 0) {
          if (!selectedLesson || !availableLessons.find(l => l.id === selectedLesson.id)) {
             const initialSelectedLessonId = userProgress?.currentLessonId || availableLessons[0].id;
             const lessonToSelect = availableLessons.find(l => l.id === initialSelectedLessonId) || availableLessons[0];
             setSelectedLesson(lessonToSelect);
          }
        } else {
          setSelectedLesson(null);
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        setSelectedLesson(null);
      }
      setIsLoadingLessons(false);
    }
    fetchLessons();
  }, [userProgress?.currentLessonId, selectedLesson]); // Added selectedLesson to ensure re-fetch logic is sound

  useEffect(() => {
    if (selectedLesson) {
      const level = getLevelForLessonId(selectedLesson.id);
      setCurrentLevel(level || null);
    } else if (userProgress?.currentLessonId) { // Fallback if selectedLesson isn't set but we have a current lesson
      const level = getLevelForLessonId(userProgress.currentLessonId);
      setCurrentLevel(level || null);
    } else {
      setCurrentLevel(LEVELS[0] || null); // Default to first level if nothing else
    }
  }, [selectedLesson, userProgress?.currentLessonId]);

  useEffect(() => {
    if (currentLevel && userProgress?.completedLessons && currentLevel.lessonIds.length > 0) {
      const completedInLevelCount = currentLevel.lessonIds.filter(id =>
        userProgress.completedLessons.includes(id)
      ).length;
      const percentage = (completedInLevelCount / currentLevel.lessonIds.length) * 100;
      setLevelProgressPercentage(Math.round(percentage));
    } else {
      setLevelProgressPercentage(0);
    }
  }, [currentLevel, userProgress?.completedLessons]);


  const handleSidebarContentToggle = useCallback((isOpen: boolean) => {
    setIsSidebarContentAreaOpen(isOpen);
  }, []);

  const handleLessonSelect = useCallback((lesson: LessonListing) => {
    setSelectedLesson(lesson);
  }, []);

  const ICON_BAR_WIDTH_PX = 64;
  const CONTENT_AREA_WIDTH_PX = 256;

  const currentSidebarTotalWidth = isSidebarContentAreaOpen
    ? ICON_BAR_WIDTH_PX + CONTENT_AREA_WIDTH_PX
    : ICON_BAR_WIDTH_PX;

  const isLessonUnlocked = (lessonId: string) => {
    if (currentUser?.isAnonymous) return true;
    return unlockedLessonsForSidebar.includes(lessonId);
  };


  return (
    <>
      <BirdsBackground />
      <Sidebar
        initialContentOpen={isSidebarContentAreaOpen}
        onContentToggle={handleSidebarContentToggle}
        onLessonSelect={handleLessonSelect}
        currentSelectedLessonId={selectedLesson?.id}
        currentLessonIdFromProgress={currentLessonIdForSidebar}
        unlockedLessonIds={unlockedLessonsForSidebar}
        isAuthenticated={!!currentUser && !currentUser.isAnonymous}
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <ProgressBar
            progress={levelProgressPercentage}
            progressText={`${levelProgressPercentage}%`}
          />
          <LevelAndInformationBar
            className="mt-2"
            sidebarWidth={0} // This prop might be deprecated
            totalPoints={totalPoints}
            currentLevel={currentLevel}
          />
        </header>

        <main className="flex-1 p-8 pt-30">
          {isLoadingAuth || isLoadingLessons ? (
            <div className="w-full max-w-4xl text-center py-10 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : selectedLesson ? (
            <div className="w-full max-w-4xl text-left mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">{selectedLesson.title}</h2>
              <p className="text-primary-foreground mb-6 text-lg">{selectedLesson.description}</p>
              {isLessonUnlocked(selectedLesson.id) ? (
                <Link href={`/lesson/${selectedLesson.id}`} passHref legacyBehavior>
                  <EightbitButton>
                    Start Lesson <ArrowRight className="ml-2 h-5 w-5" />
                  </EightbitButton>
                </Link>
              ) : (
                <EightbitButton className="opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                  Lesson Locked <ArrowRight className="ml-2 h-5 w-5" />
                </EightbitButton>
              )}
            </div>
          ) : !currentUser && !isLoadingAuth ? (
             <div className="w-full max-w-4xl text-center py-10">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to The Promptening!</h2>
                <p className="text-muted-foreground mb-6">
                  Please log in or register to save your progress and access all lessons.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/auth/login" passHref legacyBehavior>
                    <EightbitButton>
                      <LogIn className="mr-2 h-5 w-5" /> Login
                    </EightbitButton>
                  </Link>
                  <Link href="/auth/register" passHref legacyBehavior>
                    <EightbitButton>
                      <UserPlus className="mr-2 h-5 w-5" /> Register
                    </EightbitButton>
                  </Link>
                </div>
              </div>
          ) : (
            <div className="w-full max-w-4xl text-center py-10">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to The Promptening!</h2>
              <p className="text-muted-foreground">
                No lessons available at the moment, or an error occurred. Please select a lesson from the sidebar.
              </p>
            </div>
          )}
        </main>

        {/* Staircase Divs Section */}
        <div className="flex w-full items-end">
          <div className="flex-1 h-16 bg-foreground"></div>
          <div className="flex-1 h-24 bg-foreground"></div>
          <div className="flex-1 h-32 bg-foreground"></div>
          <div className="flex-1 h-40 bg-foreground"></div>
          <div className="flex-1 h-48 bg-foreground"></div>
          <div className="flex-1 h-56 bg-foreground"></div>
        </div>
      </div>
    </>
  );
}

