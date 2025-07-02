
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
import { BrainCircuit, PencilRuler, HomeIcon, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    const [pointsThisStage, setPointsThisStage] = useState(0);

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
                    setPointsThisStage(0);
                } else {
                    // Reconstruct the queue from progress
                    const newQueue: ContentQueueItem[] = [];
                    let pointsSoFar = 0;
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
                    newQueue.push(...currentStageData.items.map(item => ({ ...item, renderType: 'LessonItem' as const })));
                    setContentQueue(newQueue);

                    // Find where the active item should be
                    const lastCompletedItemIndex = newQueue.map(item => item.renderType === 'LessonItem' ? item.id : null).lastIndexOf(null);
                    setActiveContentIndex(lastCompletedItemIndex + 1);
                    setStageItemAttempts(lessonProg.stages[currentStageData.id]?.items || {});
                    setPointsThisStage(0);
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
    }, [lessonId, currentUser, isContextLoading]); // Rerun when context is loaded


    const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number, itemId: string) => {
        setStageItemAttempts(prev => {
            const currentAttemptsForThisItem = prev[itemId]?.attempts || 0;
            const newAttemptsCount = currentAttemptsForThisItem + 1;
            const wasCorrectBefore = prev[itemId]?.correct === true;
            const isNowCorrect = wasCorrectBefore || isCorrect;

            if (isCorrect && !wasCorrectBefore) {
                setPointsThisStage(p => p + pointsChange);
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
        const { nextLessonIdIfAny } = await completeStageAndProceed(
            lessonId,
            currentStage.id,
            currentStageIndex,
            stageItemAttempts,
            pointsThisStage,
            currentStage.items as LessonItem[]
        );
        
        if (currentStageIndex < 5) {
            const nextStage = lessonData!.stages[currentStageIndex + 1];
            setContentQueue(prev => [...prev, ...nextStage.items.map(item => ({ ...item, renderType: 'LessonItem' as const }))]);
            setActiveContentIndex(contentQueue.length); // The new active item is at the current end of the queue
            setStageItemAttempts({});
            setPointsThisStage(0);
        } else {
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
    
        if (itemToProcess.type === 'informationalSnippet' && !itemStatus) {
            handleAnswerSubmit(true, itemToProcess.pointsAwarded, itemToProcess.id);
        } else if (itemStatus && itemStatus.correct === false && itemStatus.attempts < 3) {
            setContentQueue(prev => [...prev, { ...itemToProcess, renderType: 'LessonItem' as const }]);
        }
        
        const nextIndex = activeContentIndex + 1;
        
        // If there are more items in the queue, just advance
        if (nextIndex < contentQueue.length) {
            setActiveContentIndex(nextIndex);
        } else {
            // End of the current stage attempt queue. Show completion screen.
            const updatedProgress = await completeStageAndProceed(
                lessonId,
                currentStage.id,
                currentStageIndex,
                stageItemAttempts,
                pointsThisStage,
                currentStage.items as LessonItem[]
            );

            const finalStageStatus = userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status ?? 'completed-good';
            
            const completionCard: StageCompleteInfo = {
                renderType: 'StageCompleteScreen',
                key: `complete-${currentStage.id}`,
                stageId: currentStage.id,
                stageTitle: currentStage.title,
                pointsEarnedInStage: pointsThisStage,
                stageItemAttempts: stageItemAttempts,
                stageItems: currentStage.items as LessonItem[],
                onNextStage: handleStartNextStage,
                onGoHome: () => router.push('/'),
                isLastStage: currentStageIndex === 5,
                stageStatus: finalStageStatus,
            };

            setContentQueue(prev => [...prev, completionCard]);
            setActiveContentIndex(nextIndex);
        }
    }, [
        activeContentIndex, 
        currentStage, 
        contentQueue, 
        stageItemAttempts, 
        completeStageAndProceed, 
        lessonId, 
        currentStageIndex, 
        pointsThisStage,
        handleAnswerSubmit,
        router,
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
            <div className="w-full max-w-4xl flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" passHref legacyBehavior><Button variant="outline" size="icon" aria-label="Back to Lessons"><HomeIcon className="h-5 w-5" /></Button></Link>
                    <h1 className="text-3xl font-bold text-primary">{lessonData.title}</h1>
                </div>
                <PointsDisplay points={userProgress?.totalPoints ?? 0} />
            </div>

            <Separator className="my-6 w-full max-w-4xl" />

            <div className="w-full max-w-2xl mb-4">
                <p className="text-sm text-center text-muted-foreground mb-1">Lesson Stage {currentStageIndex + 1} of {lessonData.stages.length}: {currentStage.title}</p>
                <div className="flex w-full h-3 rounded-full bg-muted overflow-hidden">
                    {stageProgressUi}
                </div>
            </div>

            <div className="w-full max-w-4xl">
                {isLessonFullyCompleted ? (
                    <LessonCompleteScreen lessonTitle={lessonData.title} lessonId={lessonData.id} nextLessonId={nextLessonId} points={pointsThisStage} />
                ) : (
                    <div className="space-y-8">
                        {contentQueue.map((content, index) => {
                             const isReadOnly = index < activeContentIndex;
                             const isLastItemInStage = index === contentQueue.length - 1 && content.renderType === 'LessonItem';

                             if (content.renderType === 'LessonItem') {
                                const item = content;
                                const commonProps = {
                                    key: `${item.id}-${index}`,
                                    isReadOnly,
                                    id: item.id,
                                    title: item.title,
                                    isLastItem: isLastItemInStage,
                                    lessonPoints: userProgress?.totalPoints ?? 0,
                                };

                                switch (item.type) {
                                    case 'freeResponse':
                                        return <FreeResponseQuestion {...commonProps} question={item.question} expectedAnswer={item.expectedAnswer} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} onNextQuestion={handleProceed} />;
                                    case 'multipleChoice':
                                        return <MultipleChoiceQuestion {...commonProps} question={item.question} options={item.options} correctOptionIndex={item.correctOptionIndex} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} onNextQuestion={handleProceed} />;
                                    case 'informationalSnippet':
                                        return <InformationalSnippet {...commonProps} content={item.content} pointsAwarded={item.pointsAwarded} onAcknowledged={handleProceed} onNext={handleProceed} />;
                                    case 'promptingTask':
                                        return <PromptingTask {...commonProps} taskDescription={item.taskDescription} evaluationGuidance={item.evaluationGuidance} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} onNextTask={handleProceed} />;
                                    default:
                                        const _exhaustiveCheck: never = item;
                                        return <div key={`error-${index}`}>Error: Unknown item type.</div>;
                                }
                            } else if (content.renderType === 'StageCompleteScreen') {
                                const isInteractive = index === activeContentIndex;
                                return isInteractive ? <StageCompleteScreen {...content} /> : null; // Only show the active one
                            }
                            return null;
                        })}

                        {isSubmitting && (
                            <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
                                <Loader2 className="inline-block mr-2 h-5 w-5 animate-spin" />
                                <span>Saving progress...</span>
                            </div>
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
                )}
            </div>
        </main>
    );
}
