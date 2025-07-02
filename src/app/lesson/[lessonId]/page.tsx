
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
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { useUserProgress } from '@/context/UserProgressContext';
import { getGeneratedLessonById, type Lesson, type LessonStage, type StageItemStatus, type LessonItem, type StageStatusValue } from '@/data/lessons';
import { BrainCircuit, HomeIcon, Loader2, AlertCircle, ArrowRight, Trophy, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { getUserProgress } from '@/services/userProgressService';

type StageCompleteInfo = {
    renderType: 'StageCompleteScreen';
    key: string;
    stageId: string;
    stageTitle: string;
    pointsEarnedInStage: number;
    stageItemAttempts: { [itemId: string]: StageItemStatus };
    stageItems: LessonItem[];
    onNextStage: () => void;
    onGoHome: () => void;
    isLastStage: boolean;
    stageStatus: StageStatusValue;
};
type LessonItemWithRenderType = LessonItem & { renderType: 'LessonItem'; key: string; };

type ContentQueueItem = LessonItemWithRenderType | StageCompleteInfo;


export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const lessonId = params.lessonId as string;

    const { userProgress, completeStageAndProceed, isLoadingProgress: isContextLoading, currentUser } = useUserProgress();

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
    
    // State for the FAB
    const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);
    const [isFormForSubmitValid, setIsFormForSubmitValid] = useState(false);

    const currentStageIndex = useMemo(() => userProgress?.lessonStageProgress?.[lessonId]?.currentStageIndex ?? 0, [userProgress, lessonId]);
    const currentStage = useMemo(() => lessonData?.stages[currentStageIndex], [lessonData, currentStageIndex]);

    const registerSubmit = useCallback((fn: () => void) => {
        setSubmitFn(() => fn);
    }, []);

    const unregisterSubmit = useCallback(() => {
        setSubmitFn(null);
    }, []);

    const handleFormValidity = useCallback((isValid: boolean) => {
        setIsFormForSubmitValid(isValid);
    }, []);

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
                        
                        let stagePoints = 0;
                        if (pastStageProg?.items) {
                            stage.items.forEach(item => {
                                if (pastStageProg.items[item.id]?.correct) {
                                    stagePoints += item.pointsAwarded;
                                }
                            });
                        }

                        newQueue.push({
                            renderType: 'StageCompleteScreen',
                            key: `complete-${stage.id}`,
                            stageId: stage.id,
                            stageTitle: stage.title,
                            pointsEarnedInStage: stagePoints,
                            stageItemAttempts: pastStageProg?.items || {},
                            stageItems: stage.items as LessonItem[],
                            onNextStage: () => {}, 
                            onGoHome: () => router.push('/'),
                            isLastStage: i === 5,
                            stageStatus: pastStageProg?.status || 'completed-good',
                        });
                    }
                    
                    const currentStageData = loadedLesson.stages[lessonProg.currentStageIndex];
                    const currentStageProgress = lessonProg.stages[currentStageData.id];

                    let activeItemIndex = 0;
                    if(currentStageProgress?.items){
                        const firstIncompleteItemIndex = currentStageData.items.findIndex(item => {
                            const status = currentStageProgress.items[item.id];
                            return !status || status.correct !== true;
                        });
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
                console.error("[LessonPage] Error loading lesson/progress:", err);
                setErrorLoadingLesson(err instanceof Error ? err.message : "Failed to load lesson data.");
            } finally {
                setIsLoadingLesson(false);
            }
        }
        loadLessonAndProgress();
    }, [lessonId, currentUser, isContextLoading, router, userProgress?.lessonStageProgress, userProgress?.completedLessons]);


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
                // This was the last stage, so the lesson is fully complete.
                // nextLessonId is already set from handleProceed.
                setIsLessonFullyCompleted(true);
            }
        } finally {
            isProcessing.current = false;
            setIsSubmitting(false);
        }
    }, [currentStageIndex, lessonData]);

    const handleProceed = useCallback(async () => {
        if (isProcessing.current || !currentStage || !activeContent) return;
    
        isProcessing.current = true;
        setIsSubmitting(true);
    
        try {
            const itemToProcess = activeContent;
    
            if (itemToProcess.renderType === 'StageCompleteScreen') {
                setActiveContentIndex(prev => prev + 1);
                return;
            }
            
            const itemStatus = stageItemAttempts[itemToProcess.id];
            const shouldRetry = itemStatus && itemStatus.correct === false && itemStatus.attempts < 3 && itemToProcess.type !== 'informationalSnippet';
    
            if (shouldRetry) {
                const newRetryItem: ContentQueueItem = {
                    ...itemToProcess,
                    key: `${itemToProcess.id}-retry-${itemStatus.attempts}`
                };
                
                setContentQueue(prev => {
                    const newQueue = [...prev];
                    newQueue.splice(activeContentIndex + 1, 0, newRetryItem);
                    return newQueue;
                });
                setActiveContentIndex(prev => prev + 1);
    
            } else {
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

                    setNextLessonId(stageResult.nextLessonIdIfAny);
                    
                    const finalStageStatus = stageResult.updatedProgress.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status ?? 'completed-good';
                    
                    const completionCard: StageCompleteInfo = {
                        renderType: 'StageCompleteScreen',
                        key: `complete-${currentStage.id}`,
                        stageId: currentStage.id,
                        stageTitle: currentStage.title,
                        pointsEarnedInStage: pointsThisStageSession,
                        stageItemAttempts: stageItemAttempts,
                        stageItems: currentStage.items as LessonItem[],
                        onNextStage: handleStartNextStage,
                        onGoHome: () => router.push('/'),
                        isLastStage: currentStageIndex === 5,
                        stageStatus: finalStageStatus,
                    };
                    
                    setContentQueue(prev => {
                        const newQueue = [...prev];
                        newQueue.splice(activeContentIndex + 1, 0, completionCard);
                        return newQueue;
                    });
                    setActiveContentIndex(prev => prev + 1);
                } else {
                    setActiveContentIndex(prev => prev + 1);
                }
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

        if (activeContent.renderType === 'StageCompleteScreen') {
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
            const isQuestion = item.type !== 'informationalSnippet';
            const isAnswered = !!stageItemAttempts[item.id];

            if (isQuestion && !isAnswered) {
                return {
                    visible: true,
                    onClick: submitFn || (() => {}),
                    text: 'Submit Answer',
                    icon: <Send className="h-5 w-5" />,
                    disabled: !isFormForSubmitValid || isSubmitting || !submitFn,
                };
            }
            
            return {
                visible: true,
                onClick: handleProceed,
                text: 'Next',
                icon: <ArrowRight className="h-5 w-5" />,
                disabled: isSubmitting,
            };
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
                    <Button variant="outline">
                        <HomeIcon className="mr-2 h-4 w-4" /> Login
                    </Button>
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
                <Link href="/" passHref legacyBehavior><Button variant="outline"><HomeIcon className="mr-2 h-4 w-4" /> Back to Lessons</Button></Link>
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
    
    return (
        <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
            <div className="w-full max-w-3xl flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" passHref legacyBehavior><Button variant="outline" size="icon" aria-label="Back to Lessons"><HomeIcon className="h-5 w-5" /></Button></Link>
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
                        {isLessonFullyCompleted ? (
                            <LessonCompleteScreen lessonTitle={lessonData.title} lessonId={lessonData.id} nextLessonId={nextLessonId} points={pointsThisStageSession} />
                        ) : (
                            contentQueue.map((content, index) => {
                                // Hide any content that is beyond the active item.
                                if (index > activeContentIndex) {
                                    return null;
                                }

                                const isReadOnly = index !== activeContentIndex;
                                const isActive = index === activeContentIndex;

                                const interactiveProps = isActive ? {
                                    isActive: true,
                                    registerSubmit,
                                    unregisterSubmit,
                                    onValidityChange: handleFormValidity,
                                } : {
                                    isActive: false,
                                    registerSubmit: () => {},
                                    unregisterSubmit: () => {},
                                    onValidityChange: () => {},
                                };

                                if (content.renderType === 'LessonItem') {
                                    const item = content;

                                    switch (item.type) {
                                        case 'freeResponse': {
                                            const { key, ...rest } = item;
                                            return <FreeResponseQuestion key={key} {...rest} isReadOnly={isReadOnly} onAnswerSubmit={handleAnswerSubmit} {...interactiveProps} />;
                                        }
                                        case 'multipleChoice': {
                                            const { key, ...rest } = item;
                                            return <MultipleChoiceQuestion key={key} {...rest} isReadOnly={isReadOnly} onAnswerSubmit={handleAnswerSubmit} {...interactiveProps} />;
                                        }
                                        case 'informationalSnippet': {
                                            const { key, ...rest } = item;
                                            return <InformationalSnippet key={key} {...rest} isReadOnly={isReadOnly} />;
                                        }
                                        case 'promptingTask': {
                                            const { key, ...rest } = item;
                                            return <PromptingTask key={key} {...rest} isReadOnly={isReadOnly} onAnswerSubmit={handleAnswerSubmit} {...interactiveProps} />;
                                        }
                                        default: {
                                            const _exhaustiveCheck: never = item;
                                            return <div key={`error-${index}`}>Error: Unknown item type.</div>;
                                        }
                                    }
                                } else if (content.renderType === 'StageCompleteScreen') {
                                    const { key, ...restOfContent } = content;
                                    return <StageCompleteScreen key={key} {...restOfContent} />;
                                }
                                return null;
                            })
                        )}
                        
                        {userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status === 'failed-stage' && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Stage Failed</AlertTitle>
                                <AlertDescription>
                                    You did not pass this stage. You can review the items or restart the lesson.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>


            {buttonConfig.visible && (
                <div className="fixed bottom-8 right-8 z-50">
                    <Button onClick={buttonConfig.onClick} size="lg" className="shadow-lg rounded-full pl-6 pr-4 py-6 text-lg font-semibold" disabled={buttonConfig.disabled}>
                        {isSubmitting ? (
                           <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                           <>
                             {buttonConfig.text}
                             <span className="ml-2">{buttonConfig.icon}</span>
                           </>
                        )}
                    </Button>
                </div>
            )}
        </main>
    );
}

    