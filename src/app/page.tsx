"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableLessons, type Lesson, type StageProgress, type StageStatusValue } from '@/data/lessons';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import ProgressBar from '@/components/ui/progressbar'; // Overall game progress
import Sidebar from '@/components/ui/sidebarnew';
import LevelAndInformationBar from '@/components/LevelAndInformationBar';
import BirdsBackground from '@/components/BirdsBackground';
import { EightbitButton } from '@/components/ui/eightbit-button';
import type { Level as OverallLevel } from '@/data/level-structure';
import { getLevelForLessonId, LEVELS as OVERALL_LEVELS } from '@/data/level-structure';
import { ProfilIcon } from '@/components/icons/ProfilIcon';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@/components/icons/MagnifyingGlassIcon';
import { ApplyIcon } from '@/components/icons/ApplyIcon';
import { VaryIcon } from '@/components/icons/VaryIcon';
import { LightbulbIcon } from '@/components/icons/LightbulbIcon';
import { RepeatIcon } from '@/components/icons/RepeatIcon';
import { PassIcon } from '@/components/icons/PassIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import Link from 'next/link';


type LessonListing = Omit<Lesson, 'stages'>; // Lesson listing doesn't need full stages

export default function Home() {
  const { userProgress, currentUser, isLoadingAuth } = useUserProgress();
  const totalPoints = userProgress?.totalPoints ?? 0;
  
  const [isSidebarContentAreaOpen, setIsSidebarContentAreaOpen] = useState(true);
  const [lessonList, setLessonList] = useState<LessonListing[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonListing | null>(null);
  
  const [currentOverallLevel, setCurrentOverallLevel] = useState<OverallLevel | null>(null);
  const [overallLevelProgressPercentage, setOverallLevelProgressPercentage] = useState(0);
  const [isStartingLesson, setIsStartingLesson] = useState(false);
  const router = useRouter();

  // Effect to fetch available lessons and set the selected lesson based on progress
  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
        if (availableLessons.length > 0) {
          // When progress is loaded, select the current lesson. Fallback to the first lesson.
          const initialSelectedLessonId = userProgress?.currentLessonId || availableLessons[0].id;
          const lessonToSelect = availableLessons.find(l => l.id === initialSelectedLessonId) || availableLessons[0];
          setSelectedLesson(lessonToSelect);
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
  }, [userProgress?.currentLessonId]); // Reruns when userProgress is loaded or the current lesson changes.

  // Effect to update current overall level based on selected lesson
  useEffect(() => {
    const lessonIdForLevel = selectedLesson?.id || userProgress?.currentLessonId;
    if (lessonIdForLevel) {
      const level = getLevelForLessonId(lessonIdForLevel);
      setCurrentOverallLevel(level || null);
    } else if (lessonList.length > 0) { // Fallback to first lesson's level if available
      const level = getLevelForLessonId(lessonList[0].id);
       setCurrentOverallLevel(level || OVERALL_LEVELS[0] || null);
    } else {
      setCurrentOverallLevel(OVERALL_LEVELS[0] || null); // Default to first overall level
    }
  }, [selectedLesson, userProgress?.currentLessonId, lessonList]);

  // Effect to calculate overall level progress percentage
  useEffect(() => {
    if (currentOverallLevel && userProgress?.completedLessons && currentOverallLevel.lessonIds.length > 0) {
      const completedInLevelCount = currentOverallLevel.lessonIds.filter(id =>
        userProgress.completedLessons.includes(id)
      ).length;
      const percentage = (completedInLevelCount / currentOverallLevel.lessonIds.length) * 100;
      setOverallLevelProgressPercentage(Math.round(percentage));
    } else {
      setOverallLevelProgressPercentage(0);
    }
  }, [currentOverallLevel, userProgress?.completedLessons]);


  const handleSidebarContentToggle = useCallback((isOpen: boolean) => {
    setIsSidebarContentAreaOpen(isOpen);
  }, []);

  const handleLessonSelect = useCallback((lesson: LessonListing) => {
    setSelectedLesson(lesson);
  }, []);

  const handleStartLesson = (lessonId: string) => {
    setIsStartingLesson(true);
    router.push(`/lesson/${lessonId}`);
  };

  const ICON_BAR_WIDTH_PX = 64;
  const CONTENT_AREA_WIDTH_PX = 256;
  const currentSidebarTotalWidth = isSidebarContentAreaOpen
    ? ICON_BAR_WIDTH_PX + CONTENT_AREA_WIDTH_PX
    : ICON_BAR_WIDTH_PX;

  const isLessonUnlocked = (lessonId: string) => {
    if (currentUser?.isAnonymous) return true; // Anonymous users can access all for now
    return userProgress?.unlockedLessons?.includes(lessonId) ?? false;
  };

  // Determine current stage for the selected lesson to position ProfilIcon
  const currentStageIndexOfSelectedLesson = selectedLesson && userProgress?.lessonStageProgress?.[selectedLesson.id]?.currentStageIndex !== undefined
    ? userProgress.lessonStageProgress[selectedLesson.id].currentStageIndex
    : -1; // -1 means not started or no progress data

  const getStageStatusColor = (stageId: string): StageStatusValue | 'default' => {
    if (!selectedLesson || !userProgress?.lessonStageProgress?.[selectedLesson.id]) return 'default';
    const stageProgress = userProgress.lessonStageProgress[selectedLesson.id].stages?.[stageId];
    return stageProgress?.status || 'default'; // default if stage not started or no status
  };
  
  const stageHeights = [
    'h-[6.5rem]', 'h-[9rem]', 'h-[11.5rem]', 'h-[14rem]', 'h-[16.5rem]', 'h-[19rem]'
  ];

  const stageDetails = [
    { title: 'Verstehen', icon: LightbulbIcon },
    { title: 'Anwenden', icon: ApplyIcon },
    { title: 'Variieren', icon: VaryIcon },
    { title: 'Reflektieren', icon: MagnifyingGlassIcon },
    { title: 'Wiederholen', icon: RepeatIcon },
    { title: 'Meistern', icon: PassIcon },
  ];


  return (
    <>
      <BirdsBackground />
      <Sidebar
        initialContentOpen={isSidebarContentAreaOpen}
        onContentToggle={handleSidebarContentToggle}
        onLessonSelect={handleLessonSelect}
        currentSelectedLessonId={selectedLesson?.id}
        currentLessonIdFromProgress={userProgress?.currentLessonId}
        unlockedLessonIds={userProgress?.unlockedLessons || []}
        isAuthenticated={!!currentUser && !currentUser.isAnonymous}
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <ProgressBar
            progress={overallLevelProgressPercentage} // Show overall game/level progress
            progressText={`${overallLevelProgressPercentage}% Complete - ${currentOverallLevel?.title || 'Current Level'}`}
          />
          <LevelAndInformationBar
            className="mt-2"
            sidebarWidth={0}
            totalPoints={totalPoints}
            currentLevel={currentOverallLevel}
          />
        </header>

        <main className="flex-1 p-8 pt-30">
          {isLoadingAuth || (isLoadingLessons && !selectedLesson) ? (
            <div className="w-full max-w-4xl text-center py-10 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : selectedLesson ? (
            <div className="w-full max-w-4xl text-left mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">{selectedLesson.title}</h2>
              <p className="text-primary-foreground mb-6 text-lg">{selectedLesson.description}</p>
              {isLessonUnlocked(selectedLesson.id) ? (
                <EightbitButton onClick={() => handleStartLesson(selectedLesson.id)} disabled={isStartingLesson}>
                  {isStartingLesson ? (
                    <>
                      Starting...
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      Start Lesson
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </EightbitButton>
              ) : (
                <EightbitButton className="opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                  Lesson Locked <ArrowRight className="ml-2 h-5 w-5" />
                </EightbitButton>
              )}
            </div>
          ) : !currentUser && !isLoadingAuth ? (
             <div className="w-full max-w-4xl text-center py-10">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to Prompt Ascent!</h2>
                <p className="text-muted-foreground mb-6">
                  Please log in or register to save your progress and access all lessons.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/auth/login" passHref legacyBehavior><EightbitButton><LogIn className="mr-2 h-5 w-5" /> Login</EightbitButton></Link>
                  <Link href="/auth/register" passHref legacyBehavior><EightbitButton><UserPlus className="mr-2 h-5 w-5" /> Register</EightbitButton></Link>
                </div>
              </div>
          ) : (
            <div className="w-full max-w-4xl text-center py-10">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to Prompt Ascent!</h2>
              <p className="text-muted-foreground">
                Please select a lesson from the sidebar to begin.
              </p>
            </div>
          )}
        </main>

        {/* Staircase Divs Section - Now represents stages of selectedLesson */}
        <div className="flex w-full items-end">
          {stageHeights.map((heightClass, index) => {
            const stageId = `stage${index + 1}`;
            const status = getStageStatusColor(stageId);
            const { title, icon: StageIcon } = stageDetails[index];
            
            let contentColorClass = 'text-primary-foreground';
            let showCheckIcon = false;

            if (status === 'completed-perfect' || status === 'completed-good') {
              showCheckIcon = true;
              contentColorClass = 'text-green-400';
            }

            return (
              <div key={`stage-step-${index}`} className="flex-1 flex flex-col items-center justify-end">
                {currentStageIndexOfSelectedLesson === index && (
                  <ProfilIcon className="h-20 w-20 text-[hsl(var(--foreground))] mb-2" />
                )}
                <div className={cn("w-full relative flex flex-col items-start justify-start pt-2 px-2 text-center bg-foreground", heightClass)}>
                    <div className="flex flex-col items-center w-full">
                        <div className={cn("flex items-center gap-2", contentColorClass)}>
                            <StageIcon className="h-4 w-4" />
                            <span className="font-semibold text-xs md:text-sm">{title}</span>
                        </div>
                        {showCheckIcon && <CheckIcon className="h-12 w-12 text-green-400 mt-4" />}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
