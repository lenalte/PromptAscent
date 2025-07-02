
"use client";

import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { BrainCircuit, PencilRuler, HomeIcon, Loader2, AlertCircle, ArrowRight, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

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
type LessonItemWithRenderType = LessonItem & { renderType: 'LessonItem' };

type ContentQueueItem = LessonItemWithRenderType | StageCompleteInfo;


export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const lessonId = params.lessonId as string;

    const { userProgress, completeStageAndProceed, isLoadingProgress: isContextLoading, currentUser } = useUserProgress();

    // STATE
    const [lessonData, setLessonData] = useState<Lesson | null>(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    
    // New state for unified content timeline
    const [contentQueue, setContentQueue] = useState<ContentQueueItem[]>([]);
    const [activeContentIndex, setActiveContentIndex] = useState(0);

    const [stageItemAttempts, setStageItemAttempts] = useState<{ [itemId: string]: StageItemStatus }>({});
    const [pointsThisStageSession, setPointsThisStageSession] = useState(0);

    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLessonFullyCompleted, setIsLessonFullyCompleted] = useState(false);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);

    const currentStageIndex = useMemo(() => userProgress?.lessonStageProgress?.[lessonId]?.currentStageIndex ?? 0, [userProgress, lessonId]);
    const currentStage = useMemo(() => lessonData?.stages[currentStageIndex], [lessonData, currentStageIndex]);

    // EFFECT to load lesson data and initialize stage progress
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
                    // Initialize first stage
                    const firstStage = loadedLesson.stages[0];
                    setContentQueue(firstStage.items.map(item => ({ ...item, renderType: 'LessonItem' })));
                    setActiveContentIndex(0);
                    setStageItemAttempts({});
                    setPointsThisStageSession(0);
                } else {
                    // Reconstruct the queue from progress
                    const newQueue: ContentQueueItem[] = [];
                    
                    for (let i = 0; i < lessonProg.currentStageIndex; i++) {
                        const stage = loadedLesson.stages[i];
                        const pastStageProg = lessonProg.stages[stage.id];
                        newQueue.push(...stage.items.map(item => ({ ...item, renderType: 'LessonItem' as const })));
                        
                        // Calculate points for this past stage
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
                            onNextStage: () => {}, // No-op for past stages
                            onGoHome: () => router.push('/'),
                            isLastStage: i === 5,
                            stageStatus: pastStageProg?.status || 'completed-good',
                        });
                    }
                    
                    // Add current stage items
                    const currentStageData = loadedLesson.stages[lessonProg.currentStageIndex];
                    const currentStageProgress = lessonProg.stages[currentStageData.id];

                    let activeItemIndex = 0;
                    if(currentStageProgress?.items){
                        // Find the first item in this stage that isn't fully completed
                        const firstIncompleteItemIndex = currentStageData.items.findIndex(item => {
                            const status = currentStageProgress.items[item.id];
                            return !status || status.correct !== true;
                        });
                        activeItemIndex = firstIncompleteItemIndex !== -1 ? firstIncompleteItemIndex : currentStageData.items.length;
                    }
                    
                    newQueue.push(...currentStageData.items.map(item => ({ ...item, renderType: 'LessonItem' as const })));
                    setContentQueue(newQueue);
                    setActiveContentIndex(newQueue.length - currentStageData.items.length + activeItemIndex);

                    setStageItemAttempts(currentStageProgress?.items || {});
                    setPointsThisStageSession(0); // Reset for current stage attempt
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

    const handleStartNextStage = async () => {
        if (!currentStage || isSubmitting) return;

        setIsSubmitting(true);
        await completeStageAndProceed(
            lessonId,
            currentStage.id,
            currentStageIndex,
            stageItemAttempts,
            pointsThisStageSession,
            currentStage.items as LessonItem[]
        );
        
        if (currentStageIndex < 5) {
            const nextStage = lessonData!.stages[currentStageIndex + 1];
            setContentQueue(prev => [...prev, ...nextStage.items.map(item => ({ ...item, renderType: 'LessonItem' as const }))]);
            // The active index will automatically be the item right after the StageCompleteScreen
            setActiveContentIndex(prev => prev + 1); 
            setStageItemAttempts({});
            setPointsThisStageSession(0);
        } else {
             const { nextLessonIdIfAny } = await completeStageAndProceed(
                lessonId,
                currentStage.id,
                currentStageIndex,
                stageItemAttempts,
                pointsThisStageSession,
                currentStage.items as LessonItem[]
            );
             setNextLessonId(nextLessonIdIfAny);
             setIsLessonFullyCompleted(true);
        }
        
        setIsSubmitting(false);
    };

    const handleProceed = useCallback(async () => {
        if (!currentStage || !contentQueue[activeContentIndex]) return;

        const currentContent = contentQueue[activeContentIndex];
        if (currentContent.renderType !== 'LessonItem') return;

        const itemToProcess = currentContent;
        const itemStatus = stageItemAttempts[itemToProcess.id];
        
        // This is tricky: we need to check if we are on the last item of the "current attempt block".
        // This means we look ahead in the queue. If there are no more lesson items for the current stage, it's the last one.
        let isLastItemInCurrentStageAttempt = true;
        for (let i = activeContentIndex + 1; i < contentQueue.length; i++) {
            if (contentQueue[i].renderType === 'LessonItem') {
                const futureItem = contentQueue[i] as LessonItemWithRenderType;
                // Check if future item belongs to the same stage
                if (lessonData?.stages[currentStageIndex].items.some(stageItem => stageItem.id === futureItem.id)) {
                    isLastItemInCurrentStageAttempt = false;
                    break;
                }
            }
        }
        

        // If incorrect and has attempts left, add to end of queue.
        if (itemStatus && itemStatus.correct === false && itemStatus.attempts < 3) {
            if (itemToProcess.type !== 'informationalSnippet') {
                setContentQueue(prev => [...prev, { ...itemToProcess, key: `${itemToProcess.id}-retry-${itemStatus.attempts}` }]);
            }
        }
        
        // If it's the last item in the current stage's attempt queue
        if (isLastItemInCurrentStageAttempt) {
            const finalStageStatusCheck = await completeStageAndProceed(
                lessonId,
                currentStage.id,
                currentStageIndex,
                stageItemAttempts,
                pointsThisStageSession,
                currentStage.items as LessonItem[]
            );
            
            // Refetch the latest progress to get the accurate status
            const latestProgress = await getUserProgress(currentUser!.uid);
            const finalStageStatus = latestProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status ?? 'completed-good';

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
            
            setContentQueue(prev => [...prev, completionCard]);
            setActiveContentIndex(prev => prev + 1);
        } else {
             // Simply move to the next item in the queue
             setActiveContentIndex(prev => prev + 1);
        }
    }, [
        activeContentIndex, 
        currentStage, 
        contentQueue, 
        stageItemAttempts, 
        completeStageAndProceed, 
        lessonId, 
        currentStageIndex, 
        pointsThisStageSession,
        router,
        lessonData,
        currentUser
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

    const activeContent = contentQueue.length > activeContentIndex ? contentQueue[activeContentIndex] : null;

    const canProceed = useMemo(() => {
        if (!activeContent || isSubmitting) return false;

        if (activeContent.renderType === 'StageCompleteScreen') {
            return true;
        }

        if (activeContent.renderType === 'LessonItem') {
            // An informational snippet is acknowledged on mount, so it updates stageItemAttempts.
            // Therefore, we just need to check if an attempt record exists for any item.
            return !!stageItemAttempts[activeContent.id];
        }
        return false;
    }, [activeContent, stageItemAttempts, isSubmitting]);

    const getButtonConfig = () => {
        if (activeContent?.renderType === 'StageCompleteScreen') {
            return {
                onClick: handleStartNextStage,
                text: activeContent.isLastStage ? 'Finish Lesson' : 'Next Stage',
                icon: activeContent.isLastStage ? <Trophy className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />,
                disabled: isSubmitting,
            }
        }
        return {
            onClick: handleProceed,
            text: 'Next',
            icon: <ArrowRight className="h-5 w-5" />,
            disabled: isSubmitting,
        }
    }
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

            <div className="w-full max-w-3xl">
                {isLessonFullyCompleted ? (
                    <LessonCompleteScreen lessonTitle={lessonData.title} lessonId={lessonData.id} nextLessonId={nextLessonId} points={pointsThisStageSession} />
                ) : (
                    <Card className="bg-card/50 backdrop-blur-sm p-4 md:p-6 border-border/50">
                        <CardContent className="p-0">
                            <div className="space-y-8">
                                {contentQueue.slice(0, activeContentIndex + 1).map((content, index) => {
                                    const isReadOnly = index < activeContentIndex;
                                    const key = content.key || `${(content as any).id}-${index}`; // Ensure key is unique

                                    if (content.renderType === 'LessonItem') {
                                        const item = content;
                                        const commonProps = {
                                            isReadOnly,
                                            id: item.id,
                                            title: item.title,
                                        };

                                        switch (item.type) {
                                            case 'freeResponse':
                                                return <FreeResponseQuestion key={key} {...commonProps} question={item.question} expectedAnswer={item.expectedAnswer} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} />;
                                            case 'multipleChoice':
                                                return <MultipleChoiceQuestion key={key} {...commonProps} question={item.question} options={item.options} correctOptionIndex={item.correctOptionIndex} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} />;
                                            case 'informationalSnippet':
                                                return <InformationalSnippet key={key} {...commonProps} content={item.content} pointsAwarded={item.pointsAwarded} onAcknowledged={() => handleAnswerSubmit(true, item.pointsAwarded, item.id)} />;
                                            case 'promptingTask':
                                                return <PromptingTask key={key} {...commonProps} taskDescription={item.taskDescription} evaluationGuidance={item.evaluationGuidance} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} />;
                                            default:
                                                const _exhaustiveCheck: never = item;
                                                return <div key={`error-${index}`}>Error: Unknown item type.</div>;
                                        }
                                    } else if (content.renderType === 'StageCompleteScreen') {
                                        const { key: contentKey, renderType, ...restOfContent } = content;
                                        return <StageCompleteScreen key={contentKey} {...restOfContent} />;
                                    }
                                    return null;
                                })}
                                
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
                )}
            </div>

            {canProceed && (
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

    