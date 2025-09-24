"use client";

import React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FreeResponseQuestion } from '@/components/FreeResponseQuestion';
import { MultipleChoiceQuestion } from '@/components/MultipleChoiceQuestion';
import { InformationalSnippet } from '@/components/InformationalSnippet';
import { PromptingTask } from '@/components/PromptingTask';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen';
import { StageCompleteScreen } from '@/components/StageCompleteScreen';
import { Separator } from '@/components/ui/separator';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { useUserProgress } from '@/context/UserProgressContext';
import { getGeneratedLessonById, type Lesson, type StageItemStatus, type LessonItem, type StageStatusValue } from '@/data/lessons';
import { BrainCircuit, HomeIcon, Loader2, ArrowRight, Trophy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from 'react';

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

type LessonCompleteInfo = {
    renderType: 'LessonCompleteScreen';
    key: string;
    onGoHome: () => void;
    onGoToNextLesson: () => void;
};

type LessonItemWithRenderType = LessonItem & { renderType: 'LessonItem'; key: string; };

type ContentQueueItem = LessonItemWithRenderType | StageCompleteInfo | LessonCompleteInfo;


function LessonPageInner() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const lessonId = params.lessonId as string;

    const { userProgress, completeStageAndProceed, isLoadingProgress: isContextLoading, currentUser, restartStage } = useUserProgress();

    const [lessonData, setLessonData] = useState<Lesson | null>(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);

    const [contentQueue, setContentQueue] = useState<ContentQueueItem[]>([]);
    const [activeContentIndex, setActiveContentIndex] = useState(0);

    const [stageItemAttempts, setStageItemAttempts] = useState<{ [itemId: string]: StageItemStatus }>({});
    const [pointsThisStageSession, setPointsThisStageSession] = useState(0);

    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isProcessing = useRef(false);

    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const currentStageIndex = useMemo(() => userProgress?.lessonStageProgress?.[lessonId]?.currentStageIndex ?? 0, [userProgress, lessonId]);
    const currentStage = useMemo(() => lessonData?.stages[currentStageIndex], [lessonData, currentStageIndex]);

    useEffect(() => {
        const activeItemRef = itemRefs.current[activeContentIndex];
        if (activeItemRef) {
            // A short timeout can help ensure the element is fully rendered before scrolling
            setTimeout(() => {
                activeItemRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        }
    }, [activeContentIndex]);

    const handleGoHome = useCallback(() => {
        router.push('/');
    }, [router]);

    useEffect(() => {
        async function loadLessonAndProgress() {
            if (!lessonId || isContextLoading || !currentUser) return;
            setIsLoadingLesson(true);
            setErrorLoadingLesson(null);

            try {
                const loadedLesson = await getGeneratedLessonById(lessonId);
                if (!loadedLesson || !loadedLesson.stages || loadedLesson.stages.length !== 6) {
                    setErrorLoadingLesson("Lesson content is invalid or missing.");
                    notFound();
                    return;
                }
                setLessonData(loadedLesson);

                const lessonProg = userProgress?.lessonStageProgress?.[lessonId];
                if (!lessonProg) {
                    const firstStage = loadedLesson.stages[0];
                    setContentQueue(firstStage.items.map(item => ({ ...item, renderType: 'LessonItem', key: item.id })));
                    setActiveContentIndex(0);
                    setStageItemAttempts({});
                    setPointsThisStageSession(0);
                } else {
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
                            renderType: 'StageCompleteScreen',
                            key: `complete-${stage.id}`,
                            stageId: stage.id,
                            stageTitle: stage.title,
                            basePointsAdded: stagePoints,
                            activeBoosterMultiplier: null,
                            stageItemAttempts: pastStageProg?.items || {},
                            stageItems: stage.items as LessonItem[],
                            onNextStage: () => { },
                            onGoHome: handleGoHome,
                            isLastStage: i === 5,
                            stageStatus: pastStageProg?.status || 'completed-good',
                            onRestart: () => { }, // Placeholder for past stages
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
                            onGoHome: handleGoHome,
                            isLastStage: currentStageIndex === 5,
                            stageStatus: 'failed-stage',
                            onRestart: () => handleRestartStage(),
                        };
                        newQueue.push(completionCard);
                        setContentQueue(newQueue);
                        setActiveContentIndex(newQueue.length - 1);
                        setIsLoadingLesson(false); // Manually set loading to false here
                        return; // Stop processing further for this load
                    }


                    let activeItemIndex = 0;
                    if (currentStageProgress?.items) {
                        const firstIncompleteItemIndex = currentStageData.items.findIndex(item => {
                            const status = currentStageProgress.items[item.id];
                            return !status || status.correct !== true;
                        });
                        activeItemIndex = firstIncompleteItemIndex !== -1 ? firstIncompleteItemIndex : currentStageData.items.length;
                    }

                    newQueue.push(...currentStageData.items.map(item => ({ ...item, renderType: 'LessonItem' as const, key: item.id })));

                    if (userProgress?.completedLessons.includes(lessonId)) {
                        newQueue.push({ renderType: 'LessonCompleteScreen', key: `lesson-complete-${lessonId}`, onGoHome: handleGoHome, onGoToNextLesson: handleGoHome });
                    }

                    setContentQueue(newQueue);
                    setActiveContentIndex(newQueue.length - currentStageData.items.length + activeItemIndex);
                    setStageItemAttempts(currentStageProgress?.items || {});
                    setPointsThisStageSession(0);
                }

            } catch (err) {
                console.error("[LessonPage] Error loading lesson/progress:", err);
                setErrorLoadingLesson(err instanceof Error ? err.message : "Failed to load lesson data.");
            } finally {
                setIsLoadingLesson(false);
            }
        }
        loadLessonAndProgress();
    }, [lessonId, currentUser, isContextLoading, router, userProgress, handleGoHome]);


    const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number, itemId: string) => {
        setStageItemAttempts(prev => {
            const currentAttemptsForThisItem = prev[itemId]?.attempts || 0;
            const newAttemptsCount = currentAttemptsForThisItem + 1;
            const wasCorrectBefore = prev[itemId]?.correct === true;
            const isNowCorrect = wasCorrectBefore || isCorrect;

            if (isCorrect && !wasCorrectBefore) {
                setPointsThisStageSession(p => p + pointsChange);
            }

            return {
                ...prev,
                [itemId]: {
                    attempts: newAttemptsCount,
                    correct: isNowCorrect,
                }
            };
        });
    }, []);

    const activeContent = contentQueue.length > activeContentIndex ? contentQueue[activeContentIndex] : null;

    useEffect(() => {
        if (activeContent?.renderType === 'LessonItem' && activeContent.type === 'informationalSnippet') {
            const hasBeenAttempted = !!stageItemAttempts[activeContent.id];
            if (!hasBeenAttempted) {
                handleAnswerSubmit(true, activeContent.pointsAwarded, activeContent.id);
            }
        }
    }, [activeContent, stageItemAttempts, handleAnswerSubmit]);

    const handleRestartStage = useCallback(async () => {
        if (!currentStage) return;
        await restartStage(lessonId, currentStage.id);
        // The useEffect watching userProgress will handle the refresh.
    }, [lessonId, currentStage, restartStage]);


    const handleStartNextStage = useCallback(() => {
        if (isProcessing.current) return;
        isProcessing.current = true;
        setIsSubmitting(true);

        try {
            if (currentStageIndex < 5) {
                // Advance to the next stage in the current lesson
                const nextStage = lessonData!.stages[currentStageIndex + 1];
                setContentQueue(prev => [...prev, ...nextStage.items.map(item => ({ ...item, renderType: 'LessonItem' as const, key: item.id }))]);
                setActiveContentIndex(prev => prev + 1);
                setStageItemAttempts({});
                setPointsThisStageSession(0);
            } else {
                setContentQueue(prev => {
                    const newQueue = [...prev, { renderType: 'LessonCompleteScreen', key: `lesson-complete-${lessonId}`, onGoHome: handleGoHome, onGoToNextLesson: handleGoHome }];
                    return newQueue;
                });
                setActiveContentIndex(prev => prev + 1);
            }
        } finally {
            isProcessing.current = false;
            setIsSubmitting(false);
        }
    }, [currentStageIndex, lessonData, lessonId, handleGoHome]);

    const handleProceed = useCallback(async () => {
        if (isProcessing.current || !currentStage || !activeContent) return;

        isProcessing.current = true;
        setIsSubmitting(true);

        try {
            const itemToProcess = activeContent;

            if (itemToProcess.renderType === 'StageCompleteScreen' || itemToProcess.renderType === 'LessonCompleteScreen') {
                setActiveContentIndex(prev => prev + 1);
                return;
            }

            const currentStageItemIds = new Set(lessonData?.stages[currentStageIndex].items.map(i => i.id));
            let isLastItemInCurrentStage = true;
            for (let i = activeContentIndex + 1; i < contentQueue.length; i++) {
                const futureItem = contentQueue[i];
                if (futureItem.renderType === 'LessonItem' && currentStageItemIds.has(futureItem.id)) {
                    isLastItemInCurrentStage = false;
                    break;
                }
            }

            if (isLastItemInCurrentStage) {
                const stageResult = await completeStageAndProceed(
                    lessonId,
                    currentStage.id,
                    currentStageIndex,
                    stageItemAttempts,
                    pointsThisStageSession,
                    currentStage.items as LessonItem[]
                );

                if (!stageResult || !stageResult.updatedProgress) {
                    toast({
                        title: "Error",
                        description: "Could not save your progress. Please try again.",
                        variant: "destructive"
                    });
                    isProcessing.current = false;
                    setIsSubmitting(false);
                    return; // Abort on failure
                }

                const basePoints = stageResult.basePointsAdded;

                const finalStageStatus = stageResult.updatedProgress.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status ?? 'completed-good';

                const activeBoosterMultiplier = (userProgress?.activeBooster && Date.now() < userProgress.activeBooster.expiresAt)
                    ? userProgress.activeBooster.multiplier
                    : null;

                const completionCard: StageCompleteInfo = {
                    renderType: 'StageCompleteScreen',
                    key: `complete-${currentStage.id}`,
                    stageId: currentStage.id,
                    stageTitle: currentStage.title,
                    basePointsAdded: basePoints,
                    activeBoosterMultiplier: activeBoosterMultiplier,
                    stageItemAttempts: stageItemAttempts,
                    stageItems: currentStage.items as LessonItem[],
                    onNextStage: handleStartNextStage,
                    onGoHome: handleGoHome,
                    isLastStage: currentStageIndex === 5,
                    stageStatus: finalStageStatus,
                    onRestart: handleRestartStage,
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
            toast({
                title: "Error",
                description: "An error occurred while proceeding to the next step.",
                variant: "destructive"
            });
        } finally {
            isProcessing.current = false;
            setIsSubmitting(false);
        }
    }, [
        activeContent,
        activeContentIndex,
        completeStageAndProceed,
        contentQueue,
        currentStage,
        currentStageIndex,
        handleStartNextStage,
        lessonData,
        lessonId,
        pointsThisStageSession,
        router,
        stageItemAttempts,
        toast,
        handleRestartStage,
        handleGoHome,
        userProgress
    ]);


    const stageProgressUi = useMemo(() => {
        if (!lessonData || !userProgress?.lessonStageProgress?.[lessonId]) return null;
        const lessonProg = userProgress.lessonStageProgress[lessonId];

        return lessonData.stages.map((stage, index) => {
            const stageInfo = lessonProg.stages[stage.id];
            let bgColor = 'bg-muted';

            if (index < lessonProg.currentStageIndex || stageInfo?.status?.startsWith('completed')) {
                if (stageInfo?.status === 'completed-perfect') { bgColor = 'bg-green-500'; }
                else if (stageInfo?.status === 'completed-good') { bgColor = 'bg-yellow-500'; }
                else if (stageInfo?.status === 'failed-stage') { bgColor = 'bg-red-500'; }
                else { bgColor = 'bg-gray-300'; }
            } else if (index === lessonProg.currentStageIndex) {
                bgColor = 'bg-blue-500 animate-pulse';
            }

            return (
                <div key={stage.id} className={`flex-1 h-3 rounded ${bgColor} mx-0.5 flex items-center justify-center`}>
                </div>
            );
        });
    }, [lessonData, userProgress, lessonId]);


    const getButtonConfig = () => {
        if (!activeContent) {
            return { visible: false };
        }

        if (activeContent.renderType === 'LessonCompleteScreen') {
            return {
                visible: true,
                onClick: activeContent.onGoToNextLesson,
                text: 'Zurück zur Übersicht',
                icon: <HomeIcon className="h-5 w-5" />,
                disabled: isSubmitting,
            }
        }


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
                text: activeContent.isLastStage ? 'Finish Lesson' : 'Next Stage',
                icon: activeContent.isLastStage ? <Trophy className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />,
                disabled: isSubmitting,
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
                    disabled: isSubmitting,
                };
            }
        }

        return { visible: false };
    };

    const buttonConfig = getButtonConfig();

    if (isLoadingLesson || (isContextLoading && !currentUser && !userProgress)) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Lesson Content...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <BrainCircuit className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-semibold text-destructive mb-2">Authentication Required</h1>
                <p className="text-muted-foreground mb-6">Please log in to access lessons.</p>
                <Link href="/auth/login" passHref legacyBehavior>
                    <EightbitButton as="a">
                        <HomeIcon className="mr-2 h-4 w-4" /> Login
                    </EightbitButton>
                </Link>
            </div>
        );
    }

    if (errorLoadingLesson) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <BrainCircuit className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-semibold text-destructive mb-2">Error Loading Lesson</h1>
                <p className="text-muted-foreground mb-6">{errorLoadingLesson}</p>
                <Link href="/" passHref legacyBehavior><EightbitButton as="a"><HomeIcon className="mr-2 h-4 w-4" /> Back to Lessons</EightbitButton></Link>
            </div>
        );
    }

    if (!lessonData || !currentStage || contentQueue.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Preparing Lesson Stage...</p>
            </div>
        );
    }

    // Determine if we should only show the failed screen.
    const activeContentItem = contentQueue[activeContentIndex];
    const showOnlyFailedScreen = activeContentItem?.renderType === 'StageCompleteScreen' && activeContentItem.stageStatus === 'failed-stage';

    return (
        <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
            <div className="w-full max-w-3xl flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" passHref legacyBehavior>
                        <EightbitButton as="a" aria-label="Back to Lessons" className="p-2 h-10 w-10 flex items-center justify-center">
                            <HomeIcon className="h-5 w-5" />
                        </EightbitButton>
                    </Link>
                    <h1 className="text-3xl font-bold text-primary">{lessonData.title}</h1>
                </div>
                <PointsDisplay points={userProgress?.totalPoints ?? 0} />
            </div>

            <Separator className="my-6 w-full max-w-3xl" />

            <div className="w-full max-w-3xl mb-4">
                <p className="text-sm text-center text-muted-foreground mb-1">Lesson Stage {currentStageIndex + 1} of {lessonData.stages.length}: {currentStage.title}</p>
                <div className="flex w-full h-3 rounded-full bg-muted overflow-hidden">
                    {stageProgressUi}
                </div>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm p-4 md:p-6 border-border/50 w-full max-w-3xl">
                <CardContent className="p-0">
                    <div className="space-y-8">

                        {contentQueue.map((content, index) => {
                            // If we are only showing the failed screen, hide everything that comes before it.
                            if (showOnlyFailedScreen && index < activeContentIndex) {
                                return null;
                            }
                            // And hide everything that comes after it.
                            if (index > activeContentIndex) {
                                return null;
                            }

                            const isReadOnly = index < activeContentIndex;

                            return (
                                <div key={content.key} ref={el => { if (el) itemRefs.current[index] = el; }}>
                                    {(() => {
                                        if (content.renderType === 'LessonItem') {
                                            const item = content;
                                            const itemStatus = stageItemAttempts[item.id];
                                            const hasSubmittedCorrectly = itemStatus?.correct === true;

                                            switch (item.type) {
                                                case 'freeResponse': {
                                                    const { key, ...rest } = item;
                                                    return <FreeResponseQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} />;
                                                }
                                                case 'multipleChoice': {
                                                    const { key, ...rest } = item;
                                                    return <MultipleChoiceQuestion key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} />;
                                                }
                                                case 'informationalSnippet': {
                                                    const { key, ...rest } = item;
                                                    return <InformationalSnippet key={key} {...rest} isReadOnly={isReadOnly} />;
                                                }
                                                case 'promptingTask': {
                                                    const { key, ...rest } = item;
                                                    return <PromptingTask key={key} {...rest} isReadOnly={isReadOnly || hasSubmittedCorrectly} onAnswerSubmit={handleAnswerSubmit} />;
                                                }
                                                default: {
                                                    const _exhaustiveCheck: never = item;
                                                    return <div key={`error-${index}`}>Error: Unknown item type.</div>;
                                                }
                                            }
                                        } else if (content.renderType === 'StageCompleteScreen') {
                                            const { key, ...restOfContent } = content;
                                            return <StageCompleteScreen key={key} {...restOfContent} />;
                                        } else if (content.renderType === 'LessonCompleteScreen') {
                                            const { key, ...restOfContent } = content;
                                            return <LessonCompleteScreen key={key} {...restOfContent} />;
                                        }
                                        return null;
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>


            {buttonConfig.visible && (
                <div className="fixed bottom-8 right-8 z-50">
                    <EightbitButton onClick={buttonConfig.onClick} className="text-lg font-semibold" disabled={buttonConfig.disabled}>
                        {isSubmitting ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                {buttonConfig.text}
                                <span className="ml-2">{buttonConfig.icon}</span>
                            </>
                        )}
                    </EightbitButton>
                </div>
            )}
        </main>
    );
}

export default function LessonPage() {
    return (
        <Suspense fallback={null}>
            <LessonPageInner />
        </Suspense>
    );
}


