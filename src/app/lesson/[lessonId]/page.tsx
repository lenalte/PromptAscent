
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
import { StageCompleteScreen } from '@/components/StageCompleteScreen'; // New component
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { useUserProgress } from '@/context/UserProgressContext';
import { getGeneratedLessonById, type Lesson, type LessonStage, type LessonItem as BaseLessonItem, type StageItemStatus, type StageProgress, type LessonItem } from '@/data/lessons';
import { BrainCircuit, PencilRuler, HomeIcon, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type QueuedLessonItem = BaseLessonItem & {
    key: string;
    originalItemId: string;
    originalPointsAwarded: number;
    currentAttemptNumber: number;
    currentPointsToAward: number;
};

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const lessonId = params.lessonId as string;

    const { userProgress, completeStageAndProceed, isLoadingProgress: isContextLoading, currentUser } = useUserProgress();

    const [lessonData, setLessonData] = useState<Lesson | null>(null);
    const [isLoadingLesson, setIsLoadingLesson] = useState(true);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [currentStage, setCurrentStage] = useState<LessonStage | null>(null);
    
    const [lessonQueue, setLessonQueue] = useState<QueuedLessonItem[]>([]);
    const [currentItem, setCurrentItem] = useState<QueuedLessonItem | null>(null);
    
    const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
    const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
    
    const [stageItemAttempts, setStageItemAttempts] = useState<{ [itemId: string]: StageItemStatus }>({});
    const [lessonPoints, setLessonPoints] = useState(0); 
    const [pointsEarnedThisStageSession, setPointsEarnedThisStageSession] = useState(0); // New state for stage-specific points

    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
    const [isSubmittingStage, setIsSubmittingStage] = useState(false);
    const [isLessonFullyCompleted, setIsLessonFullyCompleted] = useState(false);
    const [isStageCompletedScreenVisible, setIsStageCompletedScreenVisible] = useState(false); // New state

    useEffect(() => {
        async function loadLessonAndProgress() {
            if (!lessonId || !userProgress || !currentUser) {
                 if (!currentUser && !isContextLoading) setIsLoadingLesson(false);
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

                const lessonProg = userProgress.lessonStageProgress?.[lessonId];
                if (!lessonProg) {
                    console.warn(`No specific progress found for lesson ${lessonId}, defaulting to stage 0.`);
                    setCurrentStageIndex(0);
                    setStageItemAttempts({}); 
                    setLessonPoints(0); 
                    setPointsEarnedThisStageSession(0); // Reset session points for stage
                } else {
                    setCurrentStageIndex(lessonProg.currentStageIndex);
                    const stageId = loadedLesson.stages[lessonProg.currentStageIndex]?.id;
                    setStageItemAttempts(lessonProg.stages[stageId]?.items || {});
                    // Points are re-calculated per session, or could be summed from userProgress if preferred
                }
                setIsLessonFullyCompleted(userProgress.completedLessons.includes(lessonId));

            } catch (err) {
                console.error("[LessonPage] Error loading lesson/progress:", err);
                setErrorLoadingLesson(err instanceof Error ? err.message : "Failed to load lesson data.");
            } finally {
                setIsLoadingLesson(false);
            }
        }
        loadLessonAndProgress();
    }, [lessonId, userProgress, currentUser, isContextLoading]);

    useEffect(() => {
        if (lessonData && lessonData.stages[currentStageIndex]) {
            const stage = lessonData.stages[currentStageIndex];
            setCurrentStage(stage);
            setPointsEarnedThisStageSession(0); // Reset stage points when stage changes
            
            const initialQueuedItems: QueuedLessonItem[] = (stage.items || []).map((item, index) => ({
                ...item,
                key: `${stage.id}-${item.id}-attempt-1-${index}`,
                originalItemId: item.id,
                originalPointsAwarded: item.pointsAwarded,
                currentAttemptNumber: 1,
                currentPointsToAward: item.pointsAwarded,
            }));
            setLessonQueue(initialQueuedItems);
            setCurrentItem(initialQueuedItems[0] || null);
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
            const stageIdForAttempts = stage.id;
            const existingAttempts = userProgress?.lessonStageProgress?.[lessonId]?.stages?.[stageIdForAttempts]?.items;
            setStageItemAttempts(existingAttempts || {});

        }
    }, [lessonData, currentStageIndex, userProgress, lessonId]);


    const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number) => {
        if (!currentItem) return;

        setLastAnswerCorrectness(isCorrect);
        setIsCurrentAttemptSubmitted(true); 

        const currentAttemptsForThisItem = stageItemAttempts[currentItem.originalItemId]?.attempts || 0;
        const newAttemptsCount = currentAttemptsForThisItem + 1;

        setStageItemAttempts(prev => ({
            ...prev,
            [currentItem.originalItemId]: {
                attempts: newAttemptsCount,
                correct: isCorrect ? true : (newAttemptsCount >= 3 ? false : null),
            }
        }));
        
        if (isCorrect) {
            setLessonPoints(prev => prev + pointsChange);
            setPointsEarnedThisStageSession(prev => prev + pointsChange); // Add to stage session points
        }
    }, [currentItem, stageItemAttempts]);

    const handleProceedToNextStageFromModal = async () => {
        if (!currentStage || isSubmittingStage) return;
        setIsStageCompletedScreenVisible(false);
        setIsSubmittingStage(true);
        
        const { nextLessonIdIfAny } = await completeStageAndProceed(
            lessonId,
            currentStage.id,
            currentStageIndex,
            stageItemAttempts, 
            pointsEarnedThisStageSession,
            currentStage.items as LessonItem[]
        );
        setIsSubmittingStage(false);

         if (userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status === 'failed-stage') {
            toast({ title: "Stufe nicht bestanden", description: "Du hast zu viele Fehler gemacht. Versuche diese Stufe erneut oder starte die Lektion neu.", variant: "destructive" });
        }
    };

    const handleGoHomeFromStageModal = () => {
        setIsStageCompletedScreenVisible(false);
        router.push('/');
    };


    const handleNext = useCallback(async () => {
        if (!currentItem || !currentStage || isSubmittingStage) return;

        const currentItemStatus = stageItemAttempts[currentItem.originalItemId];
        
        if (currentItem.type === 'informationalSnippet') {
            if (!currentItemStatus || currentItemStatus.attempts === 0) { 
                 const points = currentItem.currentPointsToAward;
                 setLessonPoints(prev => prev + points);
                 setPointsEarnedThisStageSession(prev => prev + points);
            }
            setStageItemAttempts(prev => ({
                ...prev,
                [currentItem.originalItemId]: { attempts: (prev[currentItem.originalItemId]?.attempts || 0) + 1, correct: true }
            }));
        } else {
            if (lastAnswerCorrectness === false && currentItemStatus && currentItemStatus.attempts < 3) {
                const originalBaseItem = currentStage.items.find(i => i.id === currentItem.originalItemId);
                if (originalBaseItem) {
                    const newPointsToAward = Math.max(0, originalBaseItem.pointsAwarded - currentItemStatus.attempts);
                    const retryItem: QueuedLessonItem = {
                        ...originalBaseItem,
                        key: `${currentStage.id}-${currentItem.originalItemId}-attempt-${currentItemStatus.attempts + 1}`,
                        originalItemId: currentItem.originalItemId,
                        originalPointsAwarded: originalBaseItem.pointsAwarded,
                        currentAttemptNumber: currentItemStatus.attempts + 1,
                        currentPointsToAward: newPointsToAward,
                    };
                    setLessonQueue(prev => [...prev.slice(1), retryItem]);
                    setCurrentItem(lessonQueue[1] || retryItem); 
                    setIsCurrentAttemptSubmitted(false);
                    setLastAnswerCorrectness(null);
                    return;
                }
            }
        }

        const nextItemIndexInQueue = lessonQueue.findIndex(item => item.key === currentItem.key) + 1;

        if (nextItemIndexInQueue < lessonQueue.length) {
            setCurrentItem(lessonQueue[nextItemIndexInQueue]);
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
        } else {
            console.log("End of stage queue. Evaluating stage completion.");
            
            if (currentStageIndex < 5) { 
                setIsStageCompletedScreenVisible(true); 
            } else { 
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
                setIsLessonFullyCompleted(true); 
                toast({ title: "Lektion abgeschlossen!", description: `Glückwunsch! Du hast ${lessonPoints} Punkte in dieser Lektion erreicht.` });
            }
        }
    }, [currentItem, currentStage, lessonQueue, stageItemAttempts, lastAnswerCorrectness, completeStageAndProceed, lessonId, currentStageIndex, userProgress, isSubmittingStage, toast, lessonPoints, pointsEarnedThisStageSession]);


    const renderLessonItemComponent = () => {
        if (!currentItem || !currentStage) return null;

        const itemStatus = stageItemAttempts[currentItem.originalItemId];
        let pointsForThisAttempt = currentItem.originalPointsAwarded;
        if (itemStatus && itemStatus.attempts > 0 && !itemStatus.correct) { 
            pointsForThisAttempt = Math.max(0, currentItem.originalPointsAwarded - itemStatus.attempts);
        }

        const isLastItemOfStage = lessonQueue.indexOf(currentItem) === lessonQueue.length - 1;
        const isLastStageOfLesson = currentStageIndex === 5;

        const props = {
            title: currentItem.title,
            pointsForCorrect: pointsForThisAttempt,
            pointsForIncorrect: 0, 
            isAnswerSubmitted: isCurrentAttemptSubmitted,
            isLastItem: isLastItemOfStage && isLastStageOfLesson, 
            onNext: handleNext,
            lessonPoints: lessonPoints, 
            id: currentItem.originalItemId,
        };

        switch (currentItem.type) {
            case 'freeResponse':
                return <FreeResponseQuestion key={currentItem.key} {...props} question={currentItem.question} expectedAnswer={currentItem.expectedAnswer} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, pointsForThisAttempt)} onNextQuestion={handleNext} />;
            case 'multipleChoice':
                return <MultipleChoiceQuestion key={currentItem.key} {...props} question={currentItem.question} options={currentItem.options} correctOptionIndex={currentItem.correctOptionIndex} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, pointsForThisAttempt)} onNextQuestion={handleNext} />;
            case 'informationalSnippet':
                return <InformationalSnippet key={currentItem.key} {...props} content={currentItem.content} pointsAwarded={currentItem.originalPointsAwarded} onAcknowledged={handleNext} />;
            case 'promptingTask':
                return <PromptingTask key={currentItem.key} {...props} taskDescription={currentItem.taskDescription} evaluationGuidance={currentItem.evaluationGuidance} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, pointsForThisAttempt)} onNextTask={handleNext} />;
            default:
                const _exhaustiveCheck: never = currentItem;
                return <div>Error: Unknown item type.</div>;
        }
    };
    
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
    }, [lessonData, userProgress, lessonId, currentStageIndex]); 


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

    if (!lessonData || !currentStage) {
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
                    <LessonCompleteScreen points={lessonPoints} lessonTitle={lessonData.title} lessonId={lessonData.id} />
                ) : currentItem ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {currentItem.title}
                                {currentItem.currentAttemptNumber > 1 && ` (Attempt ${currentItem.currentAttemptNumber})`}
                            </h2>
                        </div>
                        {renderLessonItemComponent()}
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
                ) : (
                    <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
                        {currentStage.items.length === 0 ? "This stage has no items." : "Loading next item or stage complete..."}
                         {isSubmittingStage && <Loader2 className="inline-block ml-2 h-5 w-5 animate-spin" />}
                    </div>
                )}
            </div>
        </main>
    );
}
