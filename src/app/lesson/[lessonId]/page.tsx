
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
import { LessonCompleteScreen } from '@/components/LessonCompleteScreen'; // This might need adjustment for stage completion
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"; // For overall lesson progress
import { useUserProgress } from '@/context/UserProgressContext';
import { getGeneratedLessonById, type Lesson, type LessonStage, type LessonItem as BaseLessonItem, type StageItemStatus, type StageProgress } from '@/data/lessons';
import { BrainCircuit, PencilRuler, ListChecks, Info, BookOpen, HomeIcon, Loader2, FilePenLine, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type QueuedLessonItem = BaseLessonItem & {
    key: string; // Unique key for React list rendering (originalItemId + attempt)
    originalItemId: string; // The ID from the source lesson data
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
    const [currentItemIndexInStage, setCurrentItemIndexInStage] = useState(0);

    const [isCurrentAttemptSubmitted, setIsCurrentAttemptSubmitted] = useState(false);
    const [lastAnswerCorrectness, setLastAnswerCorrectness] = useState<boolean | null>(null);
    
    const [stageItemAttempts, setStageItemAttempts] = useState<{ [itemId: string]: StageItemStatus }>({});
    const [lessonPoints, setLessonPoints] = useState(0); // Points accumulated *within this lesson session*

    const [errorLoadingLesson, setErrorLoadingLesson] = useState<string | null>(null);
    const [isSubmittingStage, setIsSubmittingStage] = useState(false);
    const [isLessonFullyCompleted, setIsLessonFullyCompleted] = useState(false);


    useEffect(() => {
        async function loadLessonAndProgress() {
            if (!lessonId || !userProgress || !currentUser) {
                 if (!currentUser && !isContextLoading) setIsLoadingLesson(false); // Allow showing "login required" or similar
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
                    // This case should ideally be handled by UserProgressContext creating initial progress.
                    // If it happens, it implies a sync issue or new lesson not yet in progress.
                    // For now, assume first stage.
                    console.warn(`No specific progress found for lesson ${lessonId}, defaulting to stage 0.`);
                    setCurrentStageIndex(0);
                    setStageItemAttempts({}); // Fresh attempts for this stage
                    setLessonPoints(0); // Reset lesson session points
                } else {
                    setCurrentStageIndex(lessonProg.currentStageIndex);
                    const stageId = loadedLesson.stages[lessonProg.currentStageIndex]?.id;
                    setStageItemAttempts(lessonProg.stages[stageId]?.items || {});
                    // Lesson points should be total for lesson, not just stage.
                    // For simplicity, we'll track lesson-session points separately from total user points.
                    // Total points are updated in Firestore by completeStageAndProceed.
                    // To display points for the *current lesson attempt*, sum points from completed items in current session.
                    // Or, we can just display the `userProgress.totalPoints`. For now, use simple session points.
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
            
            const initialQueuedItems: QueuedLessonItem[] = (stage.items || []).map((item, index) => ({
                ...item,
                key: `${stage.id}-${item.id}-attempt-1-${index}`,
                originalItemId: item.id,
                originalPointsAwarded: item.pointsAwarded,
                currentAttemptNumber: 1, // Will be updated if retrying
                currentPointsToAward: item.pointsAwarded,
            }));
            setLessonQueue(initialQueuedItems);
            setCurrentItem(initialQueuedItems[0] || null);
            setCurrentItemIndexInStage(0);
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
            // Reset attempts for the new stage if they are not already loaded from userProgress
            if (!userProgress?.lessonStageProgress?.[lessonId]?.stages?.[stage.id]?.items) {
                 setStageItemAttempts({});
            }


        }
    }, [lessonData, currentStageIndex, userProgress, lessonId]);


    const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number) => {
        if (!currentItem) return;

        setLastAnswerCorrectness(isCorrect);
        setIsCurrentAttemptSubmitted(true); // Mark item as submitted

        const currentAttemptsForThisItem = stageItemAttempts[currentItem.originalItemId]?.attempts || 0;
        const newAttemptsCount = currentAttemptsForThisItem + 1;

        setStageItemAttempts(prev => ({
            ...prev,
            [currentItem.originalItemId]: {
                attempts: newAttemptsCount,
                correct: isCorrect ? true : (newAttemptsCount >= 3 ? false : null), // null if incorrect but can retry
            }
        }));
        
        if (isCorrect) {
            setLessonPoints(prev => prev + pointsChange);
        }
        // Deduction is handled by reduced points on retry or by game logic (not implemented here yet for deductions)
    }, [currentItem, stageItemAttempts]);


    const handleNext = useCallback(async () => {
        if (!currentItem || !currentStage || isSubmittingStage) return;

        const currentItemStatus = stageItemAttempts[currentItem.originalItemId];
        
        // Logic for Informational Snippet: auto-correct, add points if not already done for this item.
        if (currentItem.type === 'informationalSnippet') {
            if (!currentItemStatus || currentItemStatus.attempts === 0) { // Award points only on first acknowledgement
                 setLessonPoints(prev => prev + currentItem.currentPointsToAward);
            }
            setStageItemAttempts(prev => ({
                ...prev,
                [currentItem.originalItemId]: { attempts: (prev[currentItem.originalItemId]?.attempts || 0) + 1, correct: true }
            }));
        } else {
            // For other types, correctness is already set by handleAnswerSubmit
            if (lastAnswerCorrectness === false && currentItemStatus && currentItemStatus.attempts < 3) {
                // Incorrect, but can retry. Create retry item.
                const originalBaseItem = currentStage.items.find(i => i.id === currentItem.originalItemId);
                if (originalBaseItem) {
                    const newPointsToAward = Math.max(0, originalBaseItem.pointsAwarded - currentItemStatus.attempts); // Reduce points for retries
                    const retryItem: QueuedLessonItem = {
                        ...originalBaseItem,
                        key: `${currentStage.id}-${currentItem.originalItemId}-attempt-${currentItemStatus.attempts + 1}`,
                        originalItemId: currentItem.originalItemId,
                        originalPointsAwarded: originalBaseItem.pointsAwarded,
                        currentAttemptNumber: currentItemStatus.attempts + 1,
                        currentPointsToAward: newPointsToAward,
                    };
                    // Re-add to the end of the current stage's queue
                    setLessonQueue(prev => [...prev.slice(1), retryItem]);
                    setCurrentItem(lessonQueue[1] || retryItem); // next item or the retry item if queue becomes empty
                    setCurrentItemIndexInStage(prev => prev +1); // This might be tricky with re-queueing, ensure it points to next unique item
                    setIsCurrentAttemptSubmitted(false);
                    setLastAnswerCorrectness(null);
                    return;
                }
            }
        }

        // Move to the next item in the current stage's queue
        const nextItemIndexInQueue = lessonQueue.findIndex(item => item.key === currentItem.key) + 1;

        if (nextItemIndexInQueue < lessonQueue.length) {
            setCurrentItem(lessonQueue[nextItemIndexInQueue]);
            // setCurrentItemIndexInStage will be implicitly handled by currentItem updates or explicitly if needed
            setIsCurrentAttemptSubmitted(false);
            setLastAnswerCorrectness(null);
        } else {
            // End of current stage's queue (all items attempted at least once)
            console.log("End of stage queue. Evaluating stage completion.");
            setIsSubmittingStage(true);
            
            // Calculate total points for this stage based on successful first attempts or successful retries
            let pointsEarnedThisStage = 0;
            currentStage.items.forEach(item => {
                const itemStatus = stageItemAttempts[item.id];
                if (itemStatus?.correct) {
                    // Award points based on attempt number
                    // This logic assumes pointsForCorrect in QueuedLessonItem was for first attempt.
                    // A more robust way would be to store the actual points awarded per item attempt.
                    // For simplicity: if correct, use originalPointsAwarded, reduced by some penalty for retries.
                    // Let's use originalPointsAwarded for items marked correct.
                    // The pointsForCorrect prop passed to components can be adjusted based on attempts.
                    const baseItem = lessonData?.stages[currentStageIndex]?.items.find(i => i.id === item.id);
                    if (baseItem) {
                        pointsEarnedThisStage += Math.max(0, baseItem.pointsAwarded - (itemStatus.attempts -1));
                    }
                }
            });


            const { nextLessonIdIfAny } = await completeStageAndProceed(
                lessonId,
                currentStage.id,
                currentStageIndex,
                stageItemAttempts,
                pointsEarnedThisStage // Pass actual points earned based on performance.
            );
            setIsSubmittingStage(false);

            if (userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status === 'failed-stage') {
                toast({ title: "Stufe nicht bestanden", description: "Du hast zu viele Fehler gemacht. Versuche diese Stufe erneut oder starte die Lektion neu.", variant: "destructive" });
                // User stays on this stage, queue might need to be reset for retries of the whole stage.
                // For now, let's assume they can retry items individually, or this implies lesson failure.
                // The prompt indicates "Eine Stufe gilt als bestanden, wenn alle Aufgaben richtig beantwortet wurden (innerhalb von max. 3 Versuchen pro Aufgabe)."
                // This means if any item is failed after 3 attempts, the STAGE is failed.
                // The current logic in completeStageInFirestore will set stage status to 'failed-stage'.
                // UI should reflect this, perhaps offer a "Retry Stage" button.
                return; // Stay on current stage, which is now marked as failed.
            }

            if (currentStageIndex < 5) { // There are more stages in this lesson
                // setCurrentStageIndex(prev => prev + 1); // This will be handled by userProgress update effect
                // lessonQueue, currentItem will be updated by the useEffect watching currentStageIndex & lessonData
            } else { // Last stage of the lesson completed
                setIsLessonFullyCompleted(true);
                toast({ title: "Lektion abgeschlossen!", description: `Glückwunsch! Du hast ${lessonPoints} Punkte in dieser Lektion erreicht.` });
                if (nextLessonIdIfAny) {
                     // Optionally auto-navigate or prompt
                } else {
                    // This was the very last lesson of the app
                }
            }
        }
    }, [currentItem, currentStage, lessonQueue, stageItemAttempts, lastAnswerCorrectness, completeStageAndProceed, lessonId, currentStageIndex, userProgress, isSubmittingStage, toast, lessonPoints, lessonData]);


    const renderLessonItemComponent = () => {
        if (!currentItem || !currentStage) return null;

        // Determine pointsForCorrect for current attempt
        const itemStatus = stageItemAttempts[currentItem.originalItemId];
        let pointsForThisAttempt = currentItem.originalPointsAwarded;
        if (itemStatus && itemStatus.attempts > 0 && !itemStatus.correct) { // If retrying an incorrect item
            pointsForThisAttempt = Math.max(0, currentItem.originalPointsAwarded - itemStatus.attempts);
        }


        const isLastItemOfStage = lessonQueue.indexOf(currentItem) === lessonQueue.length - 1;
        const isLastStageOfLesson = currentStageIndex === 5;

        const commonPropsWithoutKey = {
            title: currentItem.title,
            pointsForCorrect: pointsForThisAttempt,
            pointsForIncorrect: 0, // Deductions are handled by reduced pointsForCorrect on retry.
            isAnswerSubmitted: isCurrentAttemptSubmitted,
            isLastItem: isLastItemOfStage && isLastStageOfLesson, // True if last item of last stage
            onNext: handleNext,
            lessonPoints: lessonPoints, // Accumulated points for this lesson session
            id: currentItem.originalItemId,
        };

        switch (currentItem.type) {
            case 'freeResponse':
                return <FreeResponseQuestion key={currentItem.key} {...commonPropsWithoutKey} question={currentItem.question} expectedAnswer={currentItem.expectedAnswer} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, pointsForThisAttempt)} onNextQuestion={handleNext} />;
            case 'multipleChoice':
                return <MultipleChoiceQuestion key={currentItem.key} {...commonPropsWithoutKey} question={currentItem.question} options={currentItem.options} correctOptionIndex={currentItem.correctOptionIndex} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, pointsForThisAttempt)} onNextQuestion={handleNext} />;
            case 'informationalSnippet':
                // For snippets, onAcknowledged leads to handleNext, which calls handleAnswerSubmit for snippets.
                // Points are handled in handleNext for snippets to award only once.
                return <InformationalSnippet key={currentItem.key} {...commonPropsWithoutKey} content={currentItem.content} pointsAwarded={currentItem.originalPointsAwarded} onAcknowledged={handleNext} onNext={handleNext} />;
            case 'promptingTask':
                return <PromptingTask key={currentItem.key} {...commonPropsWithoutKey} taskDescription={currentItem.taskDescription} evaluationGuidance={currentItem.evaluationGuidance} onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect, pointsForThisAttempt)} onNextTask={handleNext} />;
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
            let bgColor = 'bg-muted'; // Default for locked/unlocked but not started
            let IconComponent = Info;

            if (index < lessonProg.currentStageIndex || stageInfo?.status?.startsWith('completed')) { // Completed stages
                if (stageInfo?.status === 'completed-perfect') { bgColor = 'bg-green-500'; IconComponent = CheckCircle; }
                else if (stageInfo?.status === 'completed-good') { bgColor = 'bg-yellow-500'; IconComponent = CheckCircle; }
                else if (stageInfo?.status === 'failed-stage') { bgColor = 'bg-red-500'; IconComponent = XCircle; }
                else { bgColor = 'bg-gray-300'; } // Fallback for completed but no specific status
            } else if (index === lessonProg.currentStageIndex) {
                if (stageInfo?.status === 'in-progress' || stageInfo?.status === 'unlocked') {
                     bgColor = 'bg-blue-500 animate-pulse'; IconComponent = PencilRuler;
                } else if (stageInfo?.status === 'failed-stage') { // If current stage is marked failed
                    bgColor = 'bg-red-500'; IconComponent = XCircle;
                }
            }
            // Locked stages remain bg-muted

            return (
                <div key={stage.id} className={`flex-1 h-3 rounded ${bgColor} mx-0.5 flex items-center justify-center`}>
                   {/* Optionally show icon or stage number if design allows */}
                   {/* <IconComponent className="w-2 h-2 text-white opacity-75" /> */}
                </div>
            );
        });
    }, [lessonData, userProgress, lessonId]);


    if (isLoadingLesson || isContextLoading && !currentUser) {
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

    return (
        <main className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center space-y-8">
            <div className="w-full max-w-4xl flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" passHref legacyBehavior><Button variant="outline" size="icon" aria-label="Back to Lessons"><HomeIcon className="h-5 w-5" /></Button></Link>
                    <h1 className="text-3xl font-bold text-primary">{lessonData.title}</h1>
                </div>
                <PointsDisplay points={userProgress?.totalPoints ?? 0} /> {/* Show global points */}
            </div>

            <Separator className="my-6 w-full max-w-4xl" />

            {/* Stage Progress Bar */}
            <div className="w-full max-w-2xl mb-4">
                <p className="text-sm text-center text-muted-foreground mb-1">Lesson Stage {currentStageIndex + 1} of {lessonData.stages.length}: {currentStage.title}</p>
                <div className="flex w-full h-3 rounded-full bg-muted overflow-hidden">
                    {stageProgressUi}
                </div>
            </div>
            
             {/* Overall Lesson Progress (optional) */}
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
                            {/* Icon for item type can be added here */}
                        </div>
                        {renderLessonItemComponent()}
                        {userProgress?.lessonStageProgress?.[lessonId]?.stages?.[currentStage.id]?.status === 'failed-stage' && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Stage Failed</AlertTitle>
                                <AlertDescription>
                                    You did not pass this stage. You can review the items or restart the lesson.
                                     {/* Add a button to retry stage if that logic is implemented */}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 p-4 border rounded-lg bg-muted border-border text-muted-foreground text-center">
                        {currentStage.items.length === 0 ? "This stage has no items." : "Loading next item or stage complete..."}
                    </div>
                )}
            </div>
        </main>
    );
}

