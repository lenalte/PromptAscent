
"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableLessons, type Lesson, type StageProgress, type StageStatusValue, getGeneratedLessonById, type LessonStage, type StageItemStatus, type LessonItem } from '@/data/lessons';
import { ArrowRight, Loader2, LogIn, UserPlus, BrainCircuit, HomeIcon, AlertCircle, Trophy, Send, RefreshCw } from 'lucide-react';
import { useUserProgress } from '@/context/UserProgressContext';
import ProgressBar from '@/components/ui/progressbar'; // Overall game progress
import Sidebar from '@/components/ui/sidebarnew';
import LevelAndInformationBar from '@/components/LevelAndInformationBar';
import BirdsBackground from '@/components/BirdsBackground';
import { EightbitButton } from '@/components/ui/eightbit-button';
import type { Level as OverallLevel } from '@/data/level-structure';
import { getLevelForLessonId, LEVELS as OVERALL_LEVELS } from '@/data/level-structure';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@/components/icons/MagnifyingGlassIcon';
import { ApplyIcon } from '@/components/icons/ApplyIcon';
import { VaryIcon } from '@/components/icons/VaryIcon';
import { LightbulbIcon } from '@/components/icons/LightbulbIcon';
import { RepeatIcon } from '@/components/icons/RepeatIcon';
import { PassIcon } from '@/components/icons/PassIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import Link from 'next/link';
import BossChallengeDialog from '@/components/BossChallengeDialog';
import { useToast } from '@/hooks/use-toast';

// Imports from former lesson page
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet } from '@/components/InformationalSnippet';
import { PromptingTask } from '@/components/PromptingTask';
import { LikertScaleQuestion } from '@/components/LikertScaleQuestion'; // Import new component
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { StageCompleteScreen } from '@/components/StageCompleteScreen';
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { BossIcon } from '@/components/icons/BossIcon';
import { ArrowIcon } from '@/components/icons/ArrowIcon';
import Inventory from '@/components/Inventory';
import { LevelCompleteScreen } from "@/components/LevelCompleteScreen";
import { BADGES, getBadgeById } from "@/data/badges";
import { trackEvent } from '@/lib/gtagHelper';




type LessonListing = Omit<Lesson, 'stages'>;

type StageCompleteInfo = {
  renderType: 'StageCompleteScreen';
  key: string;
  stageId: string;
  stageTitle: string;
  basePointsAdded: number;
  activeBoosterMultiplier: number | null;
  stageItemAttempts: { [itemId: string]: StageItemStatus };
  stageItems: LessonItem[];
  onNextStage: () => void;
  onGoHome: () => void;
  isLastStage: boolean;
  stageStatus: StageStatusValue;
  onRestart: () => void;
};
type LessonItemWithRenderType = LessonItem & { renderType: 'LessonItem'; key: string; };

type ContentQueueItem = LessonItemWithRenderType | StageCompleteInfo;


function HomePageContent() {
  const { userProgress, currentUser, isLoadingAuth, isLoadingProgress, completeStageAndProceed, restartStage } = useUserProgress();

  const [isSidebarContentAreaOpen, setIsSidebarContentAreaOpen] = useState(true);
  const [lessonList, setLessonList] = useState<LessonListing[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonListing | null>(null);

  const [currentOverallLevel, setCurrentOverallLevel] = useState<OverallLevel | null>(null);
  const [overallLevelProgressPercentage, setOverallLevelProgressPercentage] = useState(0);
  const [isStartingLesson, setIsStartingLesson] = useState(false);
  const router = useRouter();

  const [bossChallengeInfo, setBossChallengeInfo] = useState<{ lessonId: string, stageId: string, canSkip: boolean } | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedSummaryLessonId, setSelectedSummaryLessonId] = useState<string | null>(null);


  // === State for embedded lesson view ===
  const [isLessonViewActive, setIsLessonViewActive] = useState(false);
  const { toast } = useToast();

  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [contentQueue, setContentQueue] = useState<ContentQueueItem[]>([]);
  const [activeContentIndex, setActiveContentIndex] = useState(0);
  const [stageItemAttempts, setStageItemAttempts] = useState<{ [itemId: string]: StageItemStatus }>({});
  const [pointsThisStageSession, setPointsThisStageSession] = useState(0);
  const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProcessing = useRef(false);
  const [isLessonFullyCompleted, setIsLessonFullyCompleted] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);

  const [hasAutoSelectedLesson, setHasAutoSelectedLesson] = useState(false);
  const [showLevelCompleteScreen, setShowLevelCompleteScreen] = useState(false);



  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentStageIndex = useMemo(() => userProgress?.lessonStageProgress?.[selectedLesson?.id ?? '']?.currentStageIndex ?? 0, [userProgress, selectedLesson]);
  const currentStage = useMemo(() => lessonData?.stages[currentStageIndex], [lessonData, currentStageIndex]);
  const activeContent = contentQueue.length > activeContentIndex ? contentQueue[activeContentIndex] : null;

  // Effect to fetch available lessons
  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
        if (availableLessons.length > 0 && !hasAutoSelectedLesson) {
          const initialSelectedLessonId = userProgress?.currentLessonId || availableLessons[0].id;
          const lessonToSelect = availableLessons.find(l => l.id === initialSelectedLessonId) || availableLessons[0];
          setSelectedLesson(lessonToSelect);
          setHasAutoSelectedLesson(true);
        } else if (availableLessons.length === 0) {
          setSelectedLesson(null);
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        setSelectedLesson(null);
      }
      setIsLoadingLessons(false);
    }
    if (!isLoadingProgress && !isLoadingAuth && currentUser) {
      fetchLessons();
    }
  }, [isLoadingAuth, isLoadingProgress, currentUser, hasAutoSelectedLesson]);

  // Effect to update overall level info
  useEffect(() => {
    const lessonIdForLevel = selectedLesson?.id || userProgress?.currentLessonId;
    if (lessonIdForLevel) {
      const level = getLevelForLessonId(lessonIdForLevel);
      setCurrentOverallLevel(level || null);
    } else if (lessonList.length > 0) {
      const level = getLevelForLessonId(lessonList[0].id);
      setCurrentOverallLevel(level || OVERALL_LEVELS[0] || null);
    } else {
      setCurrentOverallLevel(OVERALL_LEVELS[0] || null);
    }
  }, [selectedLesson, userProgress?.currentLessonId, lessonList]);

  const completedLessonsString = useMemo(() => JSON.stringify(userProgress?.completedLessons), [userProgress?.completedLessons]);
  useEffect(() => {
    if (currentOverallLevel && userProgress?.completedLessons && currentOverallLevel.lessonIds.length > 0) {
      const completedInLevelCount = currentOverallLevel.lessonIds.filter(id => userProgress.completedLessons.includes(id)).length;
      const percentage = (completedInLevelCount / currentOverallLevel.lessonIds.length) * 100;
      setOverallLevelProgressPercentage(Math.round(percentage));
    } else {
      setOverallLevelProgressPercentage(0);
    }
  }, [currentOverallLevel, completedLessonsString, userProgress?.completedLessons]);

  const handleSidebarContentToggle = useCallback((isOpen: boolean) => setIsSidebarContentAreaOpen(isOpen), []);

  const handleLessonSelect = useCallback((lesson: LessonListing) => {
    if (isInventoryOpen) {
      const isCompleted = userProgress?.completedLessons.includes(lesson.id) ?? false;
      if (isCompleted) {
        setSelectedSummaryLessonId(lesson.id);
      }
    } else {
      setSelectedLesson(lesson);
    }
  }, [isInventoryOpen, userProgress?.completedLessons]);

  const resetLessonState = () => {
    setLessonData(null);
    setIsLoadingLesson(true);
    setContentQueue([]);
    setActiveContentIndex(0);
    setStageItemAttempts({});
    setPointsThisStageSession(0);
    setErrorLoadingLesson(null);
    setIsSubmitting(false);
    isProcessing.current = false;
    setIsLessonFullyCompleted(false);
    setNextLessonId(null);
    itemRefs.current = [];
  };

  const handleStartLessonFlow = useCallback(() => {
    setIsStartingLesson(true);
    resetLessonState();
    setIsLessonViewActive(true);
  }, []);

  const handleExitLesson = () => {
    setIsLessonViewActive(false);
    setIsStartingLesson(false);
    resetLessonState();
  };

  const handleGoToNextLesson = useCallback(() => {
    setIsLessonViewActive(false);
    resetLessonState();
    if (nextLessonId) {
      const nextLesson = lessonList.find(l => l.id === nextLessonId);
      if (nextLesson) {
        setSelectedLesson(nextLesson);
      }
    }
  }, [nextLessonId, lessonList]);

  const handleStartLesson = useCallback((lessonId: string) => {
    if (userProgress?.lessonStageProgress?.[lessonId]) {
      const lessonProg = userProgress.lessonStageProgress[lessonId];
      const stageId = `stage${lessonProg.currentStageIndex + 1}`;
      const stage = lessonProg.stages[stageId];
      if (stage?.hasBoss && !stage.bossDefeated) {
        setBossChallengeInfo({ lessonId, stageId, canSkip: true });
        return;
      }
    }
    handleStartLessonFlow();
  }, [userProgress, handleStartLessonFlow]);

  const handleSkipBoss = useCallback(() => {
    setBossChallengeInfo(null);
    handleStartLessonFlow();
  }, [handleStartLessonFlow]);

  const handleBossChallengeClick = (stageId: string) => {
    if (selectedLesson) {
      setBossChallengeInfo({ lessonId: selectedLesson.id, stageId, canSkip: false });
    }
  };

  // === Logic for embedded lesson view ===

  useEffect(() => {
    const activeItemRef = itemRefs.current[activeContentIndex];
    if (activeItemRef) {
      setTimeout(() => activeItemRef.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [activeContentIndex]);

  const handleStartNextStage = useCallback(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setIsSubmitting(true);
    try {
      if (currentStageIndex < 5 && lessonData) {
        const nextStage = lessonData.stages[currentStageIndex + 1];
        setContentQueue(prev => [...prev, ...nextStage.items.map(item => ({ ...item, renderType: 'LessonItem' as const, key: item.id }))]);
        setActiveContentIndex(prev => prev + 1);
        setStageItemAttempts({});
        setPointsThisStageSession(0);
      } else {
        setIsLessonFullyCompleted(true);
      }
    } finally {
      isProcessing.current = false;
      setIsSubmitting(false);
    }
  }, [currentStageIndex, lessonData]);

  const handleRestartStage = useCallback(async () => {
    if (!currentStage || !selectedLesson) return;
    await restartStage(selectedLesson.id, currentStage.id);
    // The reload is handled by the main useEffect watching userProgress,
    // which will re-run loadLessonAndProgress.
  }, [selectedLesson, currentStage, restartStage]);

  const handleCompleteStage = useCallback(async (finalAttemptsState: { [itemId: string]: StageItemStatus }) => {
    if (!selectedLesson || !currentStage) return;

    isProcessing.current = true;
    setIsSubmitting(true);

    try {
      const stageResult = await completeStageAndProceed(selectedLesson.id, currentStage.id, currentStageIndex, finalAttemptsState, 0, currentStage.items as LessonItem[]);
      if (!stageResult || !stageResult.updatedProgress) {
        toast({ title: "Error", description: "Could not save your progress.", variant: "destructive" });
        return;
      }

      setNextLessonId(stageResult.nextLessonIdIfAny);
      const finalStageStatus = stageResult.updatedProgress.lessonStageProgress?.[selectedLesson.id]?.stages?.[currentStage.id]?.status ?? 'completed-good';

      const activeBoosterMultiplier = (userProgress?.activeBooster && Date.now() < userProgress.activeBooster.expiresAt)
        ? userProgress.activeBooster.multiplier
        : null;

      const completionCard: StageCompleteInfo = {
        renderType: 'StageCompleteScreen', key: `complete-${currentStage.id}`, stageId: currentStage.id, stageTitle: currentStage.title,
        basePointsAdded: stageResult.basePointsAdded, activeBoosterMultiplier, stageItemAttempts: finalAttemptsState, stageItems: currentStage.items as LessonItem[], onNextStage: handleStartNextStage,
        onGoHome: handleExitLesson, isLastStage: currentStageIndex === 5, stageStatus: finalStageStatus, onRestart: handleRestartStage
      };

      if (finalStageStatus === 'failed-stage') {
        const currentStageItemIdsSet = new Set(currentStage.items.map(i => i.id));
        const firstItemOfStageIndex = contentQueue.findIndex(c => c.renderType === 'LessonItem' && currentStageItemIdsSet.has(c.id));

        if (firstItemOfStageIndex !== -1) {
          setContentQueue(prev => {
            const queueBeforeCurrentStage = prev.slice(0, firstItemOfStageIndex);
            return [...queueBeforeCurrentStage, completionCard];
          });
          setActiveContentIndex(firstItemOfStageIndex);
        } else {
          setContentQueue(prev => [...prev, completionCard]);
          setActiveContentIndex(prev => prev + 1);
        }
      } else {
        setContentQueue(prev => {
          const newQueue = [...prev];
          newQueue.splice(activeContentIndex + 1, 0, completionCard);
          return newQueue;
        });
        setActiveContentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error in handleCompleteStage: ", error);
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      isProcessing.current = false;
      setIsSubmitting(false);
    }
  }, [selectedLesson, currentStage, currentStageIndex, completeStageAndProceed, toast, userProgress, handleStartNextStage, handleExitLesson, handleRestartStage, contentQueue, activeContentIndex]);

  const handleProceed = useCallback(async () => {
    if (isProcessing.current || !activeContent) return;

    if (activeContent.renderType === 'StageCompleteScreen') {
      setActiveContentIndex(prev => prev + 1);
      return;
    }

    const currentStageItemIds = new Set(currentStage?.items.map(i => i.id));
    let isLastItemInCurrentStage = true;
    for (let i = activeContentIndex + 1; i < contentQueue.length; i++) {
      const futureItem = contentQueue[i];
      if (futureItem.renderType === 'LessonItem' && currentStageItemIds.has(futureItem.id)) {
        isLastItemInCurrentStage = false;
        break;
      }
    }

    if (isLastItemInCurrentStage) {
      await handleCompleteStage(stageItemAttempts);
    } else {
      setActiveContentIndex(prev => prev + 1);
    }
  }, [activeContent, activeContentIndex, contentQueue, currentStage, stageItemAttempts, handleCompleteStage]);

  const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsAwarded: number, itemId: string, answer?: number) => {
    if (!currentStage) return;

    const updatedAttempts = { ...stageItemAttempts };
    const itemStatus = updatedAttempts[itemId] || { attempts: 0, correct: null, points: 0 };
    const newAttemptsCount = (itemStatus.attempts || 0) + 1;
    const wasCorrectBefore = itemStatus.correct === true;
    const isNowCorrect = wasCorrectBefore || isCorrect;

    let awardedPoints = 0;
    if (isNowCorrect && !wasCorrectBefore) {
      awardedPoints = pointsAwarded;
      setPointsThisStageSession(p => p + awardedPoints);
    }

    const newStatus: StageItemStatus = {
      attempts: newAttemptsCount,
      correct: isNowCorrect,
      points: (itemStatus.points ?? 0) + awardedPoints,
      answer: answer,
    };

    updatedAttempts[itemId] = newStatus;
    setStageItemAttempts(updatedAttempts);

    // Check for stage failure
    const isLastItem = currentStage.items[currentStage.items.length - 1].id === itemId;
    if (isLastItem && !isCorrect && newAttemptsCount >= 3) {
      setTimeout(() => handleCompleteStage(updatedAttempts), 500);
    } else if (!isCorrect && newAttemptsCount >= 3) {
      setTimeout(() => handleProceed(), 1000);
    }

  }, [stageItemAttempts, currentStage, handleProceed, handleCompleteStage]);

  const handleGoToOverviewAfterLessonCompletion = useCallback(() => {
    // Check if the current level is now complete
    const allLevelLessonsCompleted =
      currentOverallLevel &&
      currentOverallLevel.lessonIds.every(id => userProgress?.completedLessons.includes(id));

    if (allLevelLessonsCompleted && !showLevelCompleteScreen) {
      setShowLevelCompleteScreen(true);
      return; // Stop here, wait for user to close level complete screen
    }

    // Default behavior: just exit the lesson view
    handleExitLesson();
    if (nextLessonId) {
      const nextLesson = lessonList.find(l => l.id === nextLessonId);
      if (nextLesson) {
        setSelectedLesson(nextLesson);
      }
    }
  }, [currentOverallLevel, userProgress, nextLessonId, lessonList, showLevelCompleteScreen, handleExitLesson]);

  const handleLevelCompleteScreenClose = useCallback(() => {
    setShowLevelCompleteScreen(false); // Hide the screen
    handleExitLesson(); // Go back to overview
    if (nextLessonId) {
      const nextLesson = lessonList.find(l => l.id === nextLessonId);
      if (nextLesson) {
        setSelectedLesson(nextLesson);
      }
    }
  }, [nextLessonId, lessonList, handleExitLesson]);



  useEffect(() => {
    if (activeContent?.renderType === 'LessonItem' && activeContent.type === 'informationalSnippet' && !stageItemAttempts[activeContent.id]) {
      handleAnswerSubmit(true, activeContent.pointsAwarded, activeContent.id);
    }
  }, [activeContent, stageItemAttempts, handleAnswerSubmit]);

  useEffect(() => {
    async function loadLessonAndProgress() {
      if (!isLessonViewActive || !selectedLesson?.id || !currentUser) return;

      setIsLoadingLesson(true);
      setErrorLoadingLesson(null);
      const lessonId = selectedLesson.id;

      try {
        const loadedLesson = await getGeneratedLessonById(lessonId);
        if (!loadedLesson || !loadedLesson.stages || loadedLesson.stages.length !== 6) {
          setErrorLoadingLesson("Lesson content is invalid or missing.");
          return;
        }
        setLessonData(loadedLesson);

        const lessonProg = userProgress?.lessonStageProgress?.[lessonId];
        if (!lessonProg) {
          setContentQueue(loadedLesson.stages[0].items.map(item => ({ ...item, renderType: 'LessonItem', key: item.id })));
          setActiveContentIndex(0);
          setStageItemAttempts({});
          setPointsThisStageSession(0);
        } else {
          // Logic to build content queue from progress
          const newQueue: ContentQueueItem[] = [];
          for (let i = 0; i < lessonProg.currentStageIndex; i++) {
            const stage = loadedLesson.stages[i];
            const pastStageProg = lessonProg.stages[stage.id];
            newQueue.push(...stage.items.map(item => ({ ...item, renderType: 'LessonItem' as const, key: item.id })));

            let stagePoints = pastStageProg?.pointsEarned;
            if (typeof stagePoints !== 'number') {
              stagePoints = 0;
              if (pastStageProg?.items) {
                stage.items.forEach(item => {
                  if (pastStageProg.items[item.id]?.correct) {
                    stagePoints += item.pointsAwarded;
                  }
                });
              }
            }

            newQueue.push({
              renderType: 'StageCompleteScreen', key: `complete-${stage.id}`, stageId: stage.id, stageTitle: stage.title,
              basePointsAdded: stagePoints,
              activeBoosterMultiplier: null, // Booster not relevant for past stages display
              stageItemAttempts: pastStageProg?.items || {}, stageItems: stage.items as LessonItem[], onNextStage: () => { }, onGoHome: handleExitLesson,
              isLastStage: i === 5, stageStatus: pastStageProg?.status || 'completed-good', onRestart: () => { },
            });
          }
          const currentStageData = loadedLesson.stages[lessonProg.currentStageIndex];
          const currentStageProgress = lessonProg.stages[currentStageData.id];

          if (currentStageProgress?.status === 'failed-stage') {
            const completionCard: StageCompleteInfo = {
              renderType: 'StageCompleteScreen',
              key: `complete-${currentStageData.id}`,
              stageId: currentStageData.id,
              stageTitle: currentStageData.title,
              basePointsAdded: 0,
              activeBoosterMultiplier: null,
              stageItemAttempts: currentStageProgress.items,
              stageItems: currentStageData.items as LessonItem[],
              onNextStage: () => { }, // Should not be called
              onGoHome: handleExitLesson,
              isLastStage: lessonProg.currentStageIndex === 5,
              stageStatus: 'failed-stage',
              onRestart: handleRestartStage,
            };
            newQueue.push(completionCard);
            setContentQueue(newQueue);
            setActiveContentIndex(newQueue.length - 1);
            setIsLoadingLesson(false);
            return; // Stop processing further for this load
          }

          let activeItemIndex = 0;
          if (currentStageProgress?.items) {
            const firstIncompleteItemIndex = currentStageData.items.findIndex(item => !currentStageProgress.items[item.id]?.correct);
            activeItemIndex = firstIncompleteItemIndex !== -1 ? firstIncompleteItemIndex : currentStageData.items.length;
          }
          newQueue.push(...currentStageData.items.map(item => ({ ...item, renderType: 'LessonItem' as const, key: item.id })));
          setContentQueue(newQueue);
          setActiveContentIndex(newQueue.length - currentStageData.items.length + activeItemIndex);
          setStageItemAttempts(currentStageProgress?.items || {});
          setPointsThisStageSession(0);
        }
        setIsLessonFullyCompleted(userProgress?.completedLessons.includes(lessonId) ?? false);
      } catch (err) {
        console.error("[LessonView] Error loading lesson/progress:", err);
        setErrorLoadingLesson(err instanceof Error ? err.message : "Failed to load lesson data.");
      } finally {
        setIsLoadingLesson(false);
      }
    }
    if (isLessonViewActive && selectedLesson?.id) {
      loadLessonAndProgress();
    }
  }, [isLessonViewActive, selectedLesson?.id, currentUser, userProgress]);

  useEffect(() => {
    if (showLevelCompleteScreen && currentOverallLevel?.title) {
      trackEvent({
        action: "Level_Completed",
        category: "Progress",
        label: currentOverallLevel.title,
      });
    }
  }, [showLevelCompleteScreen, currentOverallLevel?.title]);

  useEffect(() => {
    if (isLessonFullyCompleted && selectedLesson?.id) {
      trackEvent({
        action: "Lesson_Completed",
        category: "Progress",
        label: `LessonID: ${selectedLesson.id}`,
      });
    }
  }, [isLessonFullyCompleted, selectedLesson?.id]);

  useEffect(() => {
    // Checke, ob aktuell ein StageCompleteScreen angezeigt wird
    const activeContentItem = contentQueue[activeContentIndex];
    if (
      activeContentItem &&
      activeContentItem.renderType === 'StageCompleteScreen'
    ) {
      trackEvent({
        action: "Stage_Completed",
        category: "Progress",
        label: `Stage: ${activeContentItem.stageTitle} (${activeContentItem.stageId})`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContentIndex]);



  const stageProgressUi = useMemo(() => {
    if (!lessonData || !userProgress?.lessonStageProgress?.[selectedLesson?.id ?? '']) return null;
    const lessonProg = userProgress.lessonStageProgress[selectedLesson!.id];
    return lessonData.stages.map((stage, index) => {
      const stageInfo = lessonProg.stages[stage.id];
      let bgColor = 'bg-muted';
      if (index < lessonProg.currentStageIndex || stageInfo?.status?.startsWith('completed')) {
        if (stageInfo?.status === 'completed-perfect') bgColor = 'bg-green-500';
        else if (stageInfo?.status === 'completed-good') bgColor = 'bg-yellow-500';
        else if (stageInfo?.status === 'failed-stage') bgColor = 'bg-red-500';
        else bgColor = 'bg-gray-300';
      } else if (index === lessonProg.currentStageIndex) {
        bgColor = 'bg-blue-500 animate-pulse';
      }
      return <div key={stage.id} className={`flex-1 h-3 rounded ${bgColor} mx-0.5`} />;
    });
  }, [lessonData, userProgress, selectedLesson]);

  const buttonConfig = useMemo(() => {
    if (!activeContent) return { visible: false };

    if (activeContent.renderType === 'StageCompleteScreen') {
      if (activeContent.stageStatus === 'failed-stage') {
        return {
          visible: true,
          onClick: handleRestartStage,
          text: 'Stufe wiederholen',
          icon: <RefreshCw className="h-5 w-5" />,
          disabled: isSubmitting,
        };
      }
      return {
        visible: true,
        onClick: handleStartNextStage,
        text: activeContent.isLastStage ? 'Beenden' : 'Nächste Stufe',
        icon: activeContent.isLastStage ? <Trophy className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />,
        disabled: isSubmitting
      };
    }

    if (activeContent.renderType === 'LessonItem') {
      const item = activeContent;
      const itemStatus = stageItemAttempts[item.id];
      const isAnsweredCorrectly = itemStatus?.correct === true;
      const maxAttemptsReached = (itemStatus?.attempts ?? 0) >= 3;

      if (isAnsweredCorrectly || item.type === 'informationalSnippet' || (maxAttemptsReached && !isAnsweredCorrectly) || item.type === 'likertScale') {
        return {
          visible: true,
          onClick: handleProceed,
          text: 'Nächste',
          icon: <ArrowIcon className="ml-2" />,
          disabled: isSubmitting
        };
      }
    }

    return { visible: false }; // No button if question is not answered or max attempts not reached
  }, [activeContent, handleStartNextStage, isSubmitting, stageItemAttempts, handleProceed, handleRestartStage]);


  const ICON_BAR_WIDTH_PX = 64;
  const CONTENT_AREA_WIDTH_PX = 288;
  const currentSidebarTotalWidth = isSidebarContentAreaOpen ? ICON_BAR_WIDTH_PX + CONTENT_AREA_WIDTH_PX : ICON_BAR_WIDTH_PX;
  const isLessonUnlocked = (lessonId: string) => userProgress?.unlockedLessons?.includes(lessonId) ?? false;
  const currentStageIndexOfSelectedLesson = selectedLesson && userProgress?.lessonStageProgress?.[selectedLesson.id]?.currentStageIndex !== undefined ? userProgress.lessonStageProgress[selectedLesson.id].currentStageIndex : -1;

  const hasStartedSelectedLesson = useMemo(() => {
    if (!selectedLesson || !userProgress?.lessonStageProgress?.[selectedLesson.id]) {
      return false;
    }
    const lessonProgress = userProgress.lessonStageProgress[selectedLesson.id];
    if (lessonProgress.currentStageIndex > 0) {
      return true;
    }
    const firstStageId = `stage1`;
    const firstStageProgress = lessonProgress.stages[firstStageId];
    return firstStageProgress && Object.keys(firstStageProgress.items).length > 0;
  }, [selectedLesson, userProgress]);

  const getStageProgressForSelectedLesson = (stageId: string) => selectedLesson && userProgress?.lessonStageProgress?.[selectedLesson.id]?.stages?.[stageId];
  const stageHeights = ['h-[6.5rem]', 'h-[9rem]', 'h-[11.5rem]', 'h-[14rem]', 'h-[16.5rem]', 'h-[19rem]'];
  const stageDetails = [
    { title: 'Verstehen', icon: LightbulbIcon }, { title: 'Anwenden', icon: ApplyIcon }, { title: 'Variieren', icon: VaryIcon },
    { title: 'Reflektieren', icon: MagnifyingGlassIcon }, { title: 'Wiederholen', icon: RepeatIcon }, { title: 'Meistern', icon: PassIcon },
  ];

  const renderLessonView = () => {
    if (isLoadingLesson || (isLoadingProgress && !currentUser && !userProgress)) {
      return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Loading Lesson...</p></div>;
    }
    if (errorLoadingLesson) {
      return <div className="flex flex-col items-center justify-center h-full"><BrainCircuit className="h-16 w-16 text-destructive mb-4" /><h1 className="text-2xl font-semibold text-destructive">Error</h1><p>{errorLoadingLesson}</p></div>;
    }
    if (!lessonData || !currentStage || contentQueue.length === 0) {
      return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Preparing Lesson...</p></div>;
    }

    // Determine if only the "failed" screen should be shown
    const activeContentItem = contentQueue[activeContentIndex];
    const showOnlyFailedScreen = activeContentItem?.renderType === 'StageCompleteScreen' && activeContentItem.stageStatus === 'failed-stage';

    const levelBadge = currentOverallLevel
      ? BADGES.find(b => b.levelId === currentOverallLevel.id)
      : undefined;



    return (
      <div className="w-full h-screen flex flex-col items-center p-8">
        <div
          className="fixed top-16 z-30 bg-background py-4 flex justify-between items-center px-6 pt-5"
          style={{
            left: currentSidebarTotalWidth,
            width: `calc(100% - ${currentSidebarTotalWidth}px)`,
          }}
        >
          <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-6 gap-20">
            <h1 className="text-3xl font-bold text-primary pr-12">{lessonData.title}</h1>
            <EightbitButton onClick={() => {
              trackEvent({
                action: "Lesson_Exited",
                category: "Lesson",
                // Falls du Infos hast, z.B. Label: `LessonID: ${selectedLesson.id}`
                // label: `LessonID: ${selectedLesson.id}`,
                label: "Lesson beendet",
              });
              handleExitLesson();
            }}
              className="font-bold ml-12"
            >Speichern und Zurück</EightbitButton>
          </div>
        </div>

        <div className="w-full max-w-3xl flex-1 min-h-0 flex flex-col pt-4">
          <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 border-border/50 w-full max-w-3xl mx-auto">
            <CardContent className="p-0">
              <div className="space-y-8">
                {showLevelCompleteScreen ? (
                  <LevelCompleteScreen
                    onGoHome={handleLevelCompleteScreenClose}
                    levelTitle={currentOverallLevel?.title ?? ""}
                    badgeName={levelBadge?.name ?? ""}
                    badgeIcon={levelBadge ? <levelBadge.icon className="h-24 w-24 text-accent" /> : undefined}
                  />
                ) : isLessonFullyCompleted ? (
                  <LessonCompleteScreen
                    onGoHome={handleGoToOverviewAfterLessonCompletion}
                    onGoToNextLesson={nextLessonId ? handleGoToNextLesson : undefined}
                  />
                ) : (
                  contentQueue.map((content, index) => {
                    // If we are only showing the failed screen, hide everything that comes before it.
                    if (showOnlyFailedScreen && index < activeContentIndex) {
                      return null;
                    }
                    // And hide everything that comes after it.
                    if (index > activeContentIndex) return null;

                    const isReadOnly = index < activeContentIndex;
                    const itemStatus = content.renderType === 'LessonItem' ? stageItemAttempts[content.id] : undefined;
                    const hasSubmittedCorrectly = itemStatus?.correct === true;
                    const maxAttemptsReached = (itemStatus?.attempts ?? 0) >= 3;

                    return (
                      <div key={content.key} ref={el => { if (el) itemRefs.current[index] = el; }}>
                        {content.renderType === 'LessonItem' && (() => {
                          const { key, ...rest } = content;
                          switch (content.type) {
                            case 'freeResponse': return <FreeResponseQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly || maxAttemptsReached} onAnswerSubmit={handleAnswerSubmit} />;
                            case 'multipleChoice': return <MultipleChoiceQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly || maxAttemptsReached} onAnswerSubmit={handleAnswerSubmit} />;
                            case 'informationalSnippet': return <InformationalSnippet key={key} {...rest} isReadOnly={isReadOnly} />;
                            case 'promptingTask': return <PromptingTask key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly || maxAttemptsReached} onAnswerSubmit={handleAnswerSubmit} />;
                            case 'likertScale': return <LikertScaleQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} lessonId={selectedLesson!.id} />;
                            default: return <div key={`error-${index}`}>Error: Unknown item type.</div>;
                          }
                        })()}
                        {content.renderType === 'StageCompleteScreen' && (() => {
                          const { key, ...rest } = content;
                          return <StageCompleteScreen key={key} {...rest} />;
                        })()}
                      </div>
                    );
                  })
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {buttonConfig.visible && !isLessonFullyCompleted && !showLevelCompleteScreen && (
          <div className="fixed bottom-8 right-8 z-50">
            <EightbitButton onClick={buttonConfig.onClick} className="text-lg font-semibold" disabled={buttonConfig.disabled}>
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <> {buttonConfig.text} <span className="ml-2">{buttonConfig.icon}</span> </>}
            </EightbitButton>
          </div>
        )}
      </div>
    );
  };

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
      <header className="fixed top-0 z-50 bg-background/80 backdrop-blur-md shadow-2xl transition-all duration-300"
        style={{
          left: currentSidebarTotalWidth,
          width: `calc(100% - ${currentSidebarTotalWidth}px)`
        }}>
        <ProgressBar progress={overallLevelProgressPercentage} />
        <LevelAndInformationBar currentLevel={currentOverallLevel} onInventoryToggle={() => setIsInventoryOpen(prev => !prev)} />
      </header>

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{
          left: currentSidebarTotalWidth,
          width: `calc(100% - ${currentSidebarTotalWidth}px)`
        }}
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >


        <main className="flex-1 flex flex-col pt-[96px] pb-[96px]">
          {isLessonViewActive ? (
            renderLessonView()
          ) : (
            <>
              <div className="flex-grow p-8">
                <div className="w-full max-w-4xl ml-8">
                  {(isLoadingLessons && !selectedLesson) ? (
                    <div className="text-center py-10 flex flex-col items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : selectedLesson ? (
                    <div className="text-left mb-8">
                      <h2 className="text-3xl font-bold text-primary-foreground mb-3">{selectedLesson.title}</h2>
                      <p className="text-primary-foreground mb-6 text-lg">{selectedLesson.description}</p>
                      {isLessonUnlocked(selectedLesson.id) ? (
                        <EightbitButton onClick={() => {
                          // Analytics-Event: Lektion starten/weiterlernen
                          trackEvent({
                            action: "Lesson_Started",
                            category: "Lesson",
                            label: `LessonID: ${selectedLesson.id} - ${hasStartedSelectedLesson ? "Weiterlernen" : "Starten"}`,
                          });
                          handleStartLesson(selectedLesson.id);
                        }}
                          disabled={isStartingLesson}
                        >
                          {isStartingLesson ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Wird gestartet...
                            </>
                          ) : (
                            <>
                              {hasStartedSelectedLesson ? "Weiterlernen" : "Lektion starten"}
                              <ArrowIcon className="ml-2" />
                            </>
                          )}
                        </EightbitButton>
                      ) : (
                        <EightbitButton className="opacity-50 cursor-not-allowed" disabled>Lektion gesperrt <ArrowIcon className="ml-2" /></EightbitButton>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <h2 className="text-2xl font-semibold text-foreground mb-2">Willkommen bei Prompt Ascent!</h2>
                      <p className="text-muted-foreground">Wähle eine Lektion in der Seitenleiste, um zu beginnen.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="fixed bottom-0 flex items-end z-50 transition-all duration-300"
                style={{
                  left: currentSidebarTotalWidth,
                  width: `calc(100% - ${currentSidebarTotalWidth}px)`
                }}
              >
                {stageHeights.map((heightClass, index) => {
                  const stageId = `stage${index + 1}`;
                  const stageProgress = getStageProgressForSelectedLesson(stageId);
                  const status = stageProgress?.status || 'locked';
                  const { title, icon: StageIcon } = stageDetails[index];
                  let contentColorClass = 'text-primary-foreground';
                  let showCheckIcon = false;
                  let showBossIcon = stageProgress?.hasBoss && !stageProgress?.bossDefeated;
                  if (status.startsWith('completed')) {
                    showCheckIcon = true;
                    contentColorClass = 'text-green-400';
                  }
                  const isLocked = status === 'locked';
                  return (
                    <div key={`stage-step-${index}`} className="flex-1 flex flex-col items-center justify-end">
                      {currentStageIndexOfSelectedLesson === index && <AvatarDisplay avatarId={userProgress?.avatarId ?? 'avatar1'} className="h-20 w-20 text-[hsl(var(--foreground))] mb-2" />}
                      <div className={cn("w-full relative flex flex-col items-center justify-start pt-2 px-2 text-center bg-foreground", heightClass)}>
                        <div className="flex flex-col items-center w-full">
                          <div className={cn("flex items-center gap-2", contentColorClass)}>
                            <StageIcon className="h-4 w-4" />
                            <span className="font-semibold text-xs md:text-sm">{title}</span>
                          </div>
                          {showCheckIcon && <CheckIcon className="h-12 w-12 text-green-400 mt-4" />}
                          {showBossIcon && (
                            <button
                              onClick={() => {
                                trackEvent({
                                  action: "Repeat_Challenge_Started",
                                  category: "Challenge",
                                  label: `Stage: ${stageId} - ${title}`,
                                });
                                handleBossChallengeClick(stageId);
                              }}
                              disabled={isLocked}
                              className={cn(
                                "mt-4",
                                isLocked
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer hover:scale-110 transition-transform"
                              )}
                              aria-label={`Start boss challenge for ${title}`}
                            >
                              <BossIcon className="h-12 w-12 text-accent animate-pulse" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>

      <Inventory
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        sidebarWidth={currentSidebarTotalWidth}
        selectedSummaryLessonId={selectedSummaryLessonId}
        onSummarySelectHandled={() => setSelectedSummaryLessonId(null)}
      />


      {bossChallengeInfo && (
        <BossChallengeDialog
          isOpen={!!bossChallengeInfo}
          onClose={() => setBossChallengeInfo(null)}
          onSkip={handleSkipBoss}
          lessonId={bossChallengeInfo.lessonId}
          stageId={bossChallengeInfo.stageId}
          canSkip={bossChallengeInfo.canSkip}
        />
      )}
    </>
  );
}

export default function Home() {
  return <HomePageContent />;
}


