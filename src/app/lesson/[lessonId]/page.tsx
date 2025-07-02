
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
import { getGeneratedLessonById, type Lesson, type LessonStage, type StageItemStatus, type LessonItem } from '@/data/lessons';
import { BrainCircuit, PencilRuler, HomeIcon, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const lessonId = params.lessonId as string;

    const { userProgress, completeStageAndProceed, isLoadingProgress: isContextLoading, currentUser } = useUserProgress();

    // STATE
    const [lessonData, setLessonData] = useState<Lesson | null>(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [activeItemIndex, setActiveItemIndex] = useState(0);

    // New state for dynamic item queue
    const [displayedItems, setDisplayedItems] = useState<LessonItem[]>([]);
    const [loadedStageId, setLoadedStageId] = useState<string | null>(null);


    const [stageItemAttempts, setStageItemAttempts] = useState<{ [itemId: string]: StageItemStatus }>({});
    const [pointsEarnedThisStageSession, setPointsEarnedThisStageSession] = useState(0);

    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
    const [isSubmittingStage, setIsSubmittingStage] = useState(false);
    const [isLessonFullyCompleted, setIsLessonFullyCompleted] = useState(false);
    const [isStageCompletedScreenVisible, setIsStageCompletedScreenVisible] = useState(false);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);

    const currentStage = useMemo(() => {
        if (!lessonData) return null;
        return lessonData.stages[currentStageIndex];
    }, [lessonData, currentStageIndex]);

    // EFFECT to load lesson data and initialize stage progress
    useEffect(() => {
        async function loadLessonAndProgress() {
            if (!lessonId || isContextLoading || !currentUser) {
                return;
            }
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
                const stageIdx = lessonProg?.currentStageIndex ?? 0;
                const stage = loadedLesson.stages[stageIdx];

                // Only initialize stage if it's new or not loaded yet
                if (stage && stage.id !== loadedStageId) {
                    setLoadedStageId(stage.id);
                    setCurrentStageIndex(stageIdx);
                    setDisplayedItems(stage.items);
                    setActiveItemIndex(0);
                    setPointsEarnedThisStageSession(0);
                    setStageItemAttempts(lessonProg?.stages?.[stage.id]?.items || {});
                } else if (stage) {
                    // Sync progress if already on this stage
                    setStageItemAttempts(lessonProg?.stages?.[stage.id]?.items || {});
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
    }, [lessonId, userProgress, currentUser, isContextLoading, loadedStageId]);


    const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number, itemId: string) => {
        if (!currentStage) return;

        setStageItemAttempts(prev => {
            const currentAttemptsForThisItem = prev[itemId]?.attempts || 0;
            const newAttemptsCount = currentAttemptsForThisItem + 1;
            const wasCorrectBefore = prev[itemId]?.correct === true;
            const isNowCorrect = wasCorrectBefore || isCorrect;

            if (isCorrect && !wasCorrectBefore) {
                setPointsEarnedThisStageSession(p => p + pointsChange);
            }

            return {
                ...prev,
                [itemId]: {
                    attempts: newAttemptsCount,
                    correct: isNowCorrect,
                }
            };
        });
    }, [currentStage]);

    const handleProceedToNextStageFromModal = async () => {
        if (!currentStage || isSubmittingStage) return;
        setIsStageCompletedScreenVisible(false);
        setIsSubmittingStage(true);
        
        await completeStageAndProceed(
            lessonId,
            currentStage.id,
            currentStageIndex,
            stageItemAttempts,
            pointsEarnedThisStageSession,
            currentStage.items as LessonItem[]
        );
        setIsSubmittingStage(false);
        setLoadedStageId(null); // Allow the next stage to be loaded by the effect

         if (userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status === 'failed-stage') {
            toast({ title: "Stufe nicht bestanden", description: "Du hast zu viele Fehler gemacht. Versuche diese Stufe erneut oder starte die Lektion neu.", variant: "destructive" });
        }
    };

    const handleGoHomeFromStageModal = () => {
        setIsStageCompletedScreenVisible(false);
        router.push('/');
    };

    const handleProceed = useCallback(async () => {
        if (!currentStage || !displayedItems) return;

        const itemToProcess = displayedItems[activeItemIndex];
        const itemStatus = stageItemAttempts[itemToProcess.id];

        // For informational snippets, which don't have a separate submit step.
        // We mark them as "correct" upon proceeding.
        if (itemToProcess.type === 'informationalSnippet' && !itemStatus) {
            handleAnswerSubmit(true, itemToProcess.pointsAwarded, itemToProcess.id);
        }
        // For other items (questions), check if they were answered incorrectly and have attempts left.
        else if (itemStatus && itemStatus.correct === false && itemStatus.attempts < 3) {
            // Re-queue the item by adding it to the end of the displayedItems array.
            setDisplayedItems(prev => [...prev, itemToProcess]);
        }
        
        const nextIndex = activeItemIndex + 1;

        if (nextIndex >= displayedItems.length) {
            // End of stage logic
            if (currentStageIndex < 5) {
                setIsStageCompletedScreenVisible(true);
            } else {
                setIsSubmittingStage(true);
                const { nextLessonIdIfAny } = await completeStageAndProceed(
                    lessonId,
                    currentStage.id,
                    currentStageIndex,
                    stageItemAttempts,
                    pointsEarnedThisStageSession,
                    currentStage.items as LessonItem[]
                );
                setNextLessonId(nextLessonIdIfAny);
                setIsSubmittingStage(false);
                setIsLessonFullyCompleted(true);
            }
        } else {
            setActiveItemIndex(nextIndex);
        }

    }, [activeItemIndex, displayedItems, stageItemAttempts, completeStageAndProceed, lessonId, currentStageIndex, pointsEarnedThisStageSession, currentStage, handleAnswerSubmit]);


    const stageProgressUi = useMemo(() => {
        if (!lessonData || !userProgress?.lessonStageProgress?.[lessonId]) return null;
        const lessonProg = userProgress.lessonStageProgress[lessonId];

        return lessonData.stages.map((stage, index) => {
            const stageInfo = lessonProg.stages[stage.id];
            let bgColor = 'bg-muted';
            let IconComponent = PencilRuler;

            if (index < lessonProg.currentStageIndex || stageInfo?.status?.startsWith('completed')) {
                if (stageInfo?.status === 'completed-perfect') { bgColor = 'bg-green-500'; IconComponent = CheckCircle; }
                else if (stageInfo?.status === 'completed-good') { bgColor = 'bg-yellow-500'; IconComponent = CheckCircle; }
                else if (stageInfo?.status === 'failed-stage') { bgColor = 'bg-red-500'; IconComponent = XCircle; }
                else { bgColor = 'bg-gray-300'; }
            } else if (index === lessonProg.currentStageIndex) {
                if (stageInfo?.status === 'in-progress' || stageInfo?.status === 'unlocked') {
                     bgColor = 'bg-blue-500 animate-pulse'; IconComponent = PencilRuler;
                } else if (stageInfo?.status === 'failed-stage') {
                    bgColor = 'bg-red-500'; IconComponent = XCircle;
                }
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

    if (!lessonData || !currentStage || displayedItems.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Preparing Lesson Stage...</p>
            </div>
        );
    }

    const overallProgressPercentage = userProgress?.lessonStageProgress?.[lessonId] ?
        (userProgress.lessonStageProgress[lessonId].currentStageIndex / lessonData.stages.length) * 100 : 0;

    if (isStageCompletedScreenVisible && currentStage) {
        return (
            <StageCompleteScreen
                stageTitle={currentStage.title}
                pointsEarnedInStage={pointsEarnedThisStageSession}
                stageItemAttempts={stageItemAttempts}
                stageItems={currentStage.items as LessonItem[]}
                onNextStage={handleProceedToNextStageFromModal}
                onGoHome={handleGoHomeFromStageModal}
                isLastStage={currentStageIndex === 5}
                stageStatus={userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status ?? 'in-progress'}
            />
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

            { !isLessonFullyCompleted && (
                <div className="w-full max-w-4xl mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-muted-foreground">Overall Lesson Progress</p>
                        <p className="text-sm font-medium text-primary">
                            Stage {currentStageIndex + 1} / {lessonData.stages.length}
                        </p>
                    </div>
                    <Progress value={overallProgressPercentage} className="w-full h-2 [&>*]:bg-primary" />
                </div>
            )}

            <div className="w-full max-w-4xl">
                {isLessonFullyCompleted ? (
                    <LessonCompleteScreen lessonTitle={lessonData.title} lessonId={lessonData.id} nextLessonId={nextLessonId} />
                ) : (
                    <div className="space-y-8">
                        {displayedItems.map((item, index) => {
                            const isItemActive = index === activeItemIndex;
                            const isReadOnly = !isItemActive;
                            
                            const isLastItemInQueue = isItemActive && (activeItemIndex === displayedItems.length - 1);
                            
                            const key = `${item.id}-${index}`;

                            const commonProps = {
                                isReadOnly,
                                id: item.id,
                                title: item.title,
                                isLastItem: isLastItemInQueue,
                                lessonPoints: userProgress?.totalPoints ?? 0,
                            };

                            switch (item.type) {
                                case 'freeResponse':
                                    return <FreeResponseQuestion key={key} {...commonProps} question={item.question} expectedAnswer={item.expectedAnswer} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} onNextQuestion={handleProceed} />;
                                case 'multipleChoice':
                                    return <MultipleChoiceQuestion key={key} {...commonProps} question={item.question} options={item.options} correctOptionIndex={item.correctOptionIndex} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} onNextQuestion={handleProceed} />;
                                case 'informationalSnippet':
                                    return <InformationalSnippet key={key} {...commonProps} content={item.content} pointsAwarded={item.pointsAwarded} onAcknowledged={handleProceed} onNext={handleProceed} />;
                                case 'promptingTask':
                                    return <PromptingTask key={key} {...commonProps} taskDescription={item.taskDescription} evaluationGuidance={item.evaluationGuidance} pointsForCorrect={item.pointsAwarded} pointsForIncorrect={0} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, item.pointsAwarded, item.id)} onNextTask={handleProceed} />;
                                default:
                                    const _exhaustiveCheck: never = item;
                                    return <div key={`error-${index}`}>Error: Unknown item type.</div>;
                            }
                        })}

                        {isSubmittingStage && (
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
