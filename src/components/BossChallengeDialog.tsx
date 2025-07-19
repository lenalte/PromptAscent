
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { Loader2, ArrowRight } from 'lucide-react';
import { useUserProgress, populateBossChallengeQuestions, resolveBossChallenge } from '@/context/UserProgressContext';
import type { BossQuestion } from '@/data/lessons';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { FreeResponseQuestion } from './FreeResponseQuestion';
import { BossIcon } from '@/components/icons/BossIcon';
import { trackEvent } from '@/lib/gtagHelper';

interface BossChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  lessonId: string;
  stageId: string;
  canSkip: boolean; // New prop to control skip button
}

const BossChallengeDialog: React.FC<BossChallengeDialogProps> = ({ isOpen, onClose, onSkip, lessonId, stageId, canSkip }) => {
  const { currentUser, userProgress, setUserProgress } = useUserProgress();
  const [view, setView] = useState<'intro' | 'challenge' | 'result'>('intro');
  const [questions, setQuestions] = useState<BossQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<{ [itemId: string]: { correct: boolean | null; attempts: number } }>({});
  const [challengeResult, setChallengeResult] = useState<'passed' | 'failed' | null>(null);
  const [awardedBooster, setAwardedBooster] = useState<number | null>(null);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadChallenge = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    setAwardedBooster(null);
    try {
      const { questions: fetchedQuestions, challenge } = await populateBossChallengeQuestions(currentUser.uid, lessonId, stageId);
      setQuestions(fetchedQuestions);
      setQuestionStatus(challenge?.questionStatus || {});
      if (fetchedQuestions.length === 0) {
        // auto-passed because no questions could be found
        setChallengeResult('passed');
        setView('result');
      } else {
        setView('intro');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load boss challenge.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, lessonId, stageId]);

  useEffect(() => {
    if (isOpen) {
      loadChallenge();
    } else {
      // Reset state when dialog is closed
      setView('intro');
      setCurrentQuestionIndex(0);
      setChallengeResult(null);
    }
  }, [isOpen, loadChallenge]);

  const handleSkip = async () => {
    // We only call the onSkip handler, which closes the dialog and starts the lesson.
    // We no longer update the database to mark it as 'skipped'.
    if (canSkip) {
      onSkip();
    }
  };


  const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number, itemId: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsSubmitting(true);
    const currentStatus = questionStatus[itemId] || { correct: null, attempts: 0 };

    const newStatus = {
      ...questionStatus,
      [itemId]: {
        ...currentStatus,
        correct: isCorrect,
        attempts: currentStatus.attempts + 1
      }
    };
    setQuestionStatus(newStatus);
    setIsSubmitting(false); // Mark submission as complete
  }, [questions, currentQuestionIndex, questionStatus]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishChallenge();
    }
  };


  const finishChallenge = async () => {
    let allCorrect = true;
    for (const q of questions) {
      if (!questionStatus[q.item.id] || questionStatus[q.item.id].correct !== true) {
        allCorrect = false;
        break;
      }
    }

    const result = allCorrect ? 'passed' : 'failed';
    setChallengeResult(result);
    setView('result');
    setIsLoading(true);

    try {
      if (currentUser) {
        const finalProgress = await resolveBossChallenge(currentUser.uid, lessonId, stageId, result, questionStatus);
        setUserProgress(finalProgress); // Update global context
        if (result === 'passed' && finalProgress.activeBooster && finalProgress.activeBooster.expiresAt > Date.now()) {
          setAwardedBooster(finalProgress.activeBooster.multiplier);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save challenge result.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return <p>No question to display.</p>;

    const isAnswered = (questionStatus[question.item.id]?.attempts ?? 0) > 0;

    const props = {
      ...question.item,
      id: question.item.id,
      title: `Frage ${currentQuestionIndex + 1} von ${questions.length}`,
      onAnswerSubmit: handleAnswerSubmit,
      isReadOnly: isAnswered, // Make it read-only if answered
    };

    switch (question.item.type) {
      case 'multipleChoice':
        return <MultipleChoiceQuestion {...props} />;
      case 'freeResponse':
        return <FreeResponseQuestion {...props} />;
      default:
        return <p>Unsupported question type.</p>;
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <DialogTitle className="sr-only">Laden</DialogTitle>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Lade Herausforderung...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <DialogTitle className="sr-only">Fehler</DialogTitle>
          <BossIcon className="h-12 w-12 text-destructive" />
          <p className="mt-4 text-destructive-foreground">{error}</p>
        </div>
      );
    }

    switch (view) {
      case 'intro':
        return (
          <>
            <DialogHeader className="items-center text-center">
              <BossIcon className="h-20 w-20 text-accent animate-pulse" />
              <DialogTitle className="text-2xl">Wiederholungs-Herausforderung</DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground mt-4">
                Du denkst, du hast die Grundlagen gemeistert? Beweise es, bevor du weitermachst!
              </DialogDescription>
            </DialogHeader>
            <div className="text-center mt-4">
              <p>Bestehe die Herausforderung, um einen Punkte-Booster zu erhalten und fortzufahren.</p>
            </div>
            <DialogFooter className="mt-6 sm:justify-center gap-4">
              {canSkip && (
                <EightbitButton onClick={handleSkip} className="bg-muted text-[hsl(var(--background))] hover:bg-muted/80">
                  Überspringen
                </EightbitButton>
              )}
              <EightbitButton onClick={() => {
                trackEvent({
                  action: 'Challenge_Accepted',
                  category: 'UI',
                  label: 'Herausforderung annehmen',
                });
                setView('challenge');
              }}>
                Herausforderung annehmen
              </EightbitButton>
            </DialogFooter>
          </>
        );
      case 'challenge':
        const currentQuestion = questions[currentQuestionIndex];
        const isAnswered = currentQuestion && (questionStatus[currentQuestion.item.id]?.attempts ?? 0) > 0;

        return (
          <>
            <DialogHeader>
              <DialogTitle>Wiederholungs-Herausforderung</DialogTitle>
              <DialogDescription>
                Beantworte die folgenden Fragen, um fortzufahren.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">{renderQuestion()}</div>
            <DialogFooter className="mt-4 p-4">
              {isAnswered && (
                <EightbitButton onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Herausforderung beenden'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </EightbitButton>
              )}
            </DialogFooter>
          </>
        );
      case 'result':
        return (
          <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
            {challengeResult === 'passed' ? (
              <>
                <DialogHeader className="items-center text-center">
                  <BossIcon className="h-16 w-16 text-accent animate-pulse" />
                  <DialogTitle className="text-2xl font-bold text-accent">Herausforderung gemeistert!</DialogTitle>
                  <DialogDescription className="mt-2 text-muted-foreground">Du hast die Herausforderung besiegt!</DialogDescription>
                </DialogHeader>
                {awardedBooster && (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold flex items-center justify-center gap-2">
                      <BossIcon className="h-6 w-6 text-accent animate-pulse" /> {awardedBooster}x Punkte-Booster aktiviert!
                    </p>
                    <p className="text-muted-foreground">Sammle in den nächsten 10 Minuten mehr Punkte!</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <DialogHeader className="items-center text-center">
                  <BossIcon className="h-16 w-16 text-destructive" />
                  <DialogTitle className="text-2xl font-bold text-destructive">Herausforderung gescheitert</DialogTitle>
                  <DialogDescription className="mt-2 text-muted-foreground">
                    Keine Sorge, du kannst trotzdem weitermachen. Die falschen Fragen wurden als Wissenslücke markiert.
                  </DialogDescription>
                </DialogHeader>
              </>
            )}
            <EightbitButton onClick={onClose} className="mt-8">Weiter</EightbitButton>
          </div>
        );
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-3xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default BossChallengeDialog;
