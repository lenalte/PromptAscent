
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
import BossChallengeDialog from '@/components/BossChallengeDialog';
import { useToast } from '@/hooks/use-toast';

// Imports from former lesson page
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet } from '@/components/InformationalSnippet';
import { PromptingTask } from '@/components/PromptingTask';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { StageCompleteScreen } from '@/components/StageCompleteScreen';
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { BossIcon } from '@/components/icons/BossIcon';


type LessonListing = Omit<Lesson, 'stages'>;

// Types from former lesson page
type StageCompleteInfo = {
    renderType: 'StageCompleteScreen';
    key: string;
    stageId: string;
    stageTitle: string;
    pointsEarnedInStage: number;
    basePointsAdded: number;
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


export default function Home() {
  const { userProgress, currentUser, isLoadingAuth, isLoadingProgress, completeStageAndProceed, restartStage } = useUserProgress();
  
  const [isSidebarContentAreaOpen, setIsSidebarContentAreaOpen] = useState(true);
  const [lessonList, setLessonList] = useState<LessonListing[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonListing | null>(null);
  
  const [currentOverallLevel, setCurrentOverallLevel] = useState<OverallLevel | null>(null);
  const [overallLevelProgressPercentage, setOverallLevelProgressPercentage] = useState(0);
  const [isStartingLesson, setIsStartingLesson] = useState(false);
  const router = useRouter();

  const [bossChallengeInfo, setBossChallengeInfo] = useState<{lessonId: string, stageId: string} | null>(null);

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
  
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentStageIndex = useMemo(() => userProgress?.lessonStageProgress?.[selectedLesson?.id ?? '']?.currentStageIndex ?? 0, [userProgress, selectedLesson]);
  const currentStage = useMemo(() => lessonData?.stages[currentStageIndex], [lessonData, currentStageIndex]);

  // Effect to fetch available lessons
  useEffect(() => {
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const availableLessons = await getAvailableLessons();
        setLessonList(availableLessons);
        if (availableLessons.length > 0) {
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
    if (!isLoadingProgress && !isLoadingAuth) {
        fetchLessons();
    }
  }, [isLoadingAuth, isLoadingProgress, userProgress?.currentLessonId]);

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
  const handleLessonSelect = useCallback((lesson: LessonListing) => setSelectedLesson(lesson), []);

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

  const handleStartLesson = useCallback((lessonId: string) => {
    if (userProgress?.lessonStageProgress?.[lessonId]) {
        const lessonProg = userProgress.lessonStageProgress[lessonId];
        const stage = lessonProg.stages[`stage${lessonProg.currentStageIndex + 1}`];
        if (stage?.hasBoss && !stage.bossDefeated) {
            setBossChallengeInfo({ lessonId, stageId: `stage${lessonProg.currentStageIndex + 1}` });
            return;
        }
    }
    setIsStartingLesson(true);
    resetLessonState();
    setIsLessonViewActive(true);
    // No need to setIsStartingLesson(false) as the view changes
  }, [userProgress]);

  const handleExitLesson = () => {
    setIsLessonViewActive(false);
    setIsStartingLesson(false);
    resetLessonState();
  };

  const handleBossChallengeClick = (stageId: string) => {
    if (selectedLesson) {
      setBossChallengeInfo({ lessonId: selectedLesson.id, stageId });
    }
  };

  // === Logic for embedded lesson view ===
  useEffect(() => {
    const activeItemRef = itemRefs.current[activeContentIndex];
    if (activeItemRef) {
      setTimeout(() => activeItemRef.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [activeContentIndex]);

  const handleRestartStage = useCallback(async () => {
      if (!currentStage || !selectedLesson) return;
      await restartStage(selectedLesson.id, currentStage.id);
      // The reload is handled by the main useEffect watching userProgress,
      // which will re-run loadLessonAndProgress.
  }, [selectedLesson, currentStage, restartStage]);


  useEffect(() => {
    async function loadLessonAndProgress() {
        if (!isLessonViewActive || !selectedLesson || !currentUser) return;
        
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
                        renderType: 'StageCompleteScreen', key: `complete-${stage.id}`, stageId: stage.id, stageTitle: stage.title, pointsEarnedInStage: stagePoints,
                        basePointsAdded: stagePoints,
                        stageItemAttempts: pastStageProg?.items || {}, stageItems: stage.items as LessonItem[], onNextStage: () => {}, onGoHome: handleExitLesson,
                        isLastStage: i === 5, stageStatus: pastStageProg?.status || 'completed-good', onRestart: () => {},
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
                        pointsEarnedInStage: 0,
                        basePointsAdded: 0,
                        stageItemAttempts: currentStageProgress.items,
                        stageItems: currentStageData.items as LessonItem[],
                        onNextStage: () => {}, // Should not be called
                        onGoHome: handleExitLesson,
                        isLastStage: lessonProg.currentStageIndex === 5,
                        stageStatus: 'failed-stage',
                        onRestart: handleRestartStage,
                    };
                    newQueue.push(completionCard);
                    setContentQueue(newQueue);
                    setActiveContentIndex(newQueue.length -1);
                    setIsLoadingLesson(false);
                    return; // Stop processing further for this load
                }

                let activeItemIndex = 0;
                if(currentStageProgress?.items){
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
    loadLessonAndProgress();
  }, [isLessonViewActive, selectedLesson, currentUser, userProgress]);

  const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number, itemId: string) => {
    setStageItemAttempts(prev => {
        const currentAttemptsForThisItem = prev[itemId]?.attempts || 0;
        const wasCorrectBefore = prev[itemId]?.correct === true;
        const isNowCorrect = wasCorrectBefore || isCorrect;
        
        if (isCorrect && !wasCorrectBefore) {
             setPointsThisStageSession(p => p + pointsChange);
        }
        
        return { 
            ...prev, 
            [itemId]: { 
                attempts: currentAttemptsForThisItem + 1, 
                correct: isNowCorrect,
            } 
        };
    });
  }, []);
  
  const activeContent = contentQueue.length > activeContentIndex ? contentQueue[activeContentIndex] : null;

  useEffect(() => {
    if (activeContent?.renderType === 'LessonItem' && activeContent.type === 'informationalSnippet' && !stageItemAttempts[activeContent.id]) {
        handleAnswerSubmit(true, activeContent.pointsAwarded, activeContent.id);
    }
  }, [activeContent, stageItemAttempts, handleAnswerSubmit]);

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

  const handleProceed = useCallback(async () => {
    if (isProcessing.current || !currentStage || !activeContent || !selectedLesson) return;
    isProcessing.current = true;
    setIsSubmitting(true);
    try {
        const itemToProcess = activeContent;
        if (itemToProcess.renderType === 'StageCompleteScreen') {
            setActiveContentIndex(prev => prev + 1);
            return;
        }
        
        const currentStageItemIds = new Set(lessonData?.stages[currentStageIndex].items.map(i => i.id));
        const isLastItemInCurrentStage = !contentQueue.slice(activeContentIndex + 1).some(futureItem => futureItem.renderType === 'LessonItem' && currentStageItemIds.has(futureItem.id));

        if (isLastItemInCurrentStage) {
            const stageResult = await completeStageAndProceed(selectedLesson.id, currentStage.id, currentStageIndex, stageItemAttempts, pointsThisStageSession, currentStage.items as LessonItem[]);
            if (!stageResult || !stageResult.updatedProgress) {
                toast({ title: "Error", description: "Could not save your progress.", variant: "destructive" });
                isProcessing.current = false;
                setIsSubmitting(false);
                return;
            }
            const pointsActuallyAdded = stageResult.pointsAdded;
            const basePoints = stageResult.basePointsAdded;
            setNextLessonId(stageResult.nextLessonIdIfAny);
            const finalStageStatus = stageResult.updatedProgress.lessonStageProgress?.[selectedLesson.id]?.stages?.[currentStage.id]?.status ?? 'completed-good';
            
            const completionCard: StageCompleteInfo = {
                renderType: 'StageCompleteScreen', key: `complete-${currentStage.id}`, stageId: currentStage.id, stageTitle: currentStage.title,
                pointsEarnedInStage: pointsActuallyAdded, basePointsAdded: basePoints, stageItemAttempts, stageItems: currentStage.items as LessonItem[], onNextStage: handleStartNextStage,
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
        } else {
            setActiveContentIndex(prev => prev + 1);
        }
    } catch (error) {
        console.error("Error in handleProceed: ", error);
        toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
        isProcessing.current = false;
        setIsSubmitting(false);
    }
  }, [activeContent, activeContentIndex, completeStageAndProceed, contentQueue, currentStage, currentStageIndex, handleStartNextStage, lessonData, selectedLesson, pointsThisStageSession, stageItemAttempts, toast, handleExitLesson, handleRestartStage]);

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
        
        if (isAnsweredCorrectly || item.type === 'informationalSnippet' || maxAttemptsReached) {
          return { 
              visible: true, 
              onClick: handleProceed, 
              text: 'Nächste', 
              icon: <ArrowRight className="h-5 w-5" />, 
              disabled: isSubmitting 
            };
        }
    }

    return { visible: false }; // No button if question is not answered or max attempts not reached
  }, [activeContent, handleStartNextStage, isSubmitting, stageItemAttempts, handleProceed, handleRestartStage]);


  const ICON_BAR_WIDTH_PX = 64;
  const CONTENT_AREA_WIDTH_PX = 256;
  const currentSidebarTotalWidth = isSidebarContentAreaOpen ? ICON_BAR_WIDTH_PX + CONTENT_AREA_WIDTH_PX : ICON_BAR_WIDTH_PX;
  const isLessonUnlocked = (lessonId: string) => currentUser?.isAnonymous || (userProgress?.unlockedLessons?.includes(lessonId) ?? false);
  const currentStageIndexOfSelectedLesson = selectedLesson && userProgress?.lessonStageProgress?.[selectedLesson.id]?.currentStageIndex !== undefined ? userProgress.lessonStageProgress[selectedLesson.id].currentStageIndex : -1;
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

    return (
        <div className="w-full p-8">
            <div className="w-full max-w-3xl flex justify-between items-center mx-auto mb-4">
                <h1 className="text-3xl font-bold text-primary">{lessonData.title}</h1>
                <EightbitButton onClick={handleExitLesson}>BEENDEN</EightbitButton>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 border-border/50 w-full max-w-3xl mx-auto">
                <CardContent className="p-0">
                    <div className="space-y-8">
                        {isLessonFullyCompleted ? (
                            <LessonCompleteScreen lessonTitle={lessonData.title} lessonId={lessonData.id} nextLessonId={nextLessonId} points={pointsThisStageSession} />
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
                                
                                return (
                                    <div key={content.key} ref={el => { if(el) itemRefs.current[index] = el; }}>
                                        {content.renderType === 'LessonItem' && (() => {
                                            const { key, ...rest } = content;
                                            switch (content.type) {
                                                case 'freeResponse': return <FreeResponseQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} />;
                                                case 'multipleChoice': return <MultipleChoiceQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} />;
                                                case 'informationalSnippet': return <InformationalSnippet key={key} {...rest} isReadOnly={isReadOnly} />;
                                                case 'promptingTask': return <PromptingTask key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} />;
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

            {buttonConfig.visible && (
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

      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarTotalWidth}px` }}
      >
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <ProgressBar progress={overallLevelProgressPercentage} progressText={`${overallLevelProgressPercentage}% Complete - ${currentOverallLevel?.title || 'Current Level'}`} />
          <LevelAndInformationBar currentLevel={currentOverallLevel} />
        </header>

        <main className="flex-1 flex flex-col">
            {isLessonViewActive ? (
                renderLessonView()
            ) : (
                <>
                    <div className="flex-grow p-8">
                        <div className="w-full max-w-4xl mx-auto">
                            {isLoadingAuth || isLoadingProgress || (isLoadingLessons && !selectedLesson) ? (
                                <div className="text-center py-10 flex flex-col items-center justify-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-muted-foreground">Loading...</p>
                                </div>
                            ) : selectedLesson ? (
                                <div className="text-left mb-8">
                                    <h2 className="text-3xl font-bold text-primary-foreground mb-3">{selectedLesson.title}</h2>
                                    <p className="text-primary-foreground mb-6 text-lg">{selectedLesson.description}</p>
                                    {isLessonUnlocked(selectedLesson.id) ? (
                                        <EightbitButton onClick={() => handleStartLesson(selectedLesson.id)} disabled={isStartingLesson}>
                                            {isStartingLesson ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting...</> : <>Start Lesson <ArrowRight className="ml-2 h-5 w-5" /></>}
                                        </EightbitButton>
                                    ) : (
                                        <EightbitButton className="opacity-50 cursor-not-allowed" disabled>Lesson Locked <ArrowRight className="ml-2 h-5 w-5" /></EightbitButton>
                                    )}
                                </div>
                            ) : !currentUser && !isLoadingAuth ? (
                                <div className="text-center py-10">
                                    <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to Prompt Ascent!</h2>
                                    <p className="text-muted-foreground mb-6">Please log in or register to save your progress and access all lessons.</p>
                                    <div className="flex justify-center space-x-4">
                                        <Link href="/auth/login" passHref legacyBehavior><EightbitButton as="a"><LogIn className="mr-2 h-5 w-5" /> Login</EightbitButton></Link>
                                        <Link href="/auth/register" passHref legacyBehavior><EightbitButton as="a"><UserPlus className="mr-2 h-5 w-5" /> Register</EightbitButton></Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to Prompt Ascent!</h2>
                                    <p className="text-muted-foreground">Please select a lesson from the sidebar to begin.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full items-end mt-auto">
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
                                    {currentStageIndexOfSelectedLesson === index && <ProfilIcon className="h-20 w-20 text-[hsl(var(--foreground))] mb-2" />}
                                    <div className={cn("w-full relative flex flex-col items-center justify-start pt-2 px-2 text-center bg-foreground", heightClass)}>
                                        <div className="flex flex-col items-center w-full">
                                            <div className={cn("flex items-center gap-2", contentColorClass)}>
                                                <StageIcon className="h-4 w-4" />
                                                <span className="font-semibold text-xs md:text-sm">{title}</span>
                                            </div>
                                            {showCheckIcon && <CheckIcon className="h-12 w-12 text-green-400 mt-4" />}
                                            {showBossIcon && (
                                                <button
                                                  onClick={() => handleBossChallengeClick(stageId)}
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

      {bossChallengeInfo && (
        <BossChallengeDialog
          isOpen={!!bossChallengeInfo}
          onClose={() => setBossChallengeInfo(null)}
          lessonId={bossChallengeInfo.lessonId}
          stageId={bossChallengeInfo.stageId}
        />
      )}
    </>
  );
}

    

    

    
