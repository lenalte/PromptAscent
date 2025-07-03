
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { Loader2, ShieldQuestion, Trophy, XCircle, Skull, ShieldAlert, Sword, ArrowRight, Send } from 'lucide-react';
import { useUserProgress, populateBossChallengeQuestions, resolveBossChallenge } from '@/context/UserProgressContext';
import type { BossQuestion } from '@/data/lessons';
import type { Boss as BossInfo, BossIconType } from '@/data/boss-data';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { FreeResponseQuestion } from './FreeResponseQuestion';
import { Separator } from './ui/separator';

interface BossChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  stageId: string;
}

// Helper component to render the correct icon based on the string identifier
const BossIcon = ({ icon, className }: { icon: BossIconType, className?: string }) => {
  switch (icon) {
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Skull':
      return <Skull className={className} />;
    case 'Sword':
      return <Sword className={className} />;
    default:
      return <ShieldQuestion className={className} />; // Fallback icon
  }
};

const BossChallengeDialog: React.FC<BossChallengeDialogProps> = ({ isOpen, onClose, lessonId, stageId }) => {
  const { currentUser, userProgress, setUserProgress } = useUserProgress();
  const [view, setView] = useState<'intro' | 'challenge' | 'result'>('intro');
  const [bossInfo, setBossInfo] = useState<BossInfo | null>(null);
  const [questions, setQuestions] = useState<BossQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<{ [itemId: string]: { correct: boolean | null; attempts: number } }>({});
  const [challengeResult, setChallengeResult] = useState<'passed' | 'failed' | null>(null);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);
  const [isFormForSubmitValid, setIsFormForSubmitValid] = useState(false);

  const registerSubmit = useCallback((fn: () => void) => {
    setSubmitFn(() => fn);
  }, []);

  const unregisterSubmit = useCallback(() => {
    setSubmitFn(null);
  }, []);
  
  const handleFormValidity = useCallback((isValid: boolean) => {
    setIsFormForSubmitValid(isValid);
  }, []);


  const loadChallenge = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const { boss, questions: fetchedQuestions, challenge } = await populateBossChallengeQuestions(currentUser.uid, lessonId, stageId);
      setBossInfo(boss);
      setQuestions(fetchedQuestions);
      setQuestionStatus(challenge?.questionStatus || {});
      if(fetchedQuestions.length === 0){
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
    }
  }, [isOpen, loadChallenge]);

  const handleAnswerSubmit = useCallback((isCorrect: boolean, pointsChange: number, itemId: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

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
    unregisterSubmit();
    setIsSubmitting(false); // Mark submission as complete
  }, [questions, currentQuestionIndex, questionStatus, unregisterSubmit]);
  
  const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setIsFormForSubmitValid(false);
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
      if(currentUser){
          const finalProgress = await resolveBossChallenge(currentUser.uid, lessonId, stageId, result, questionStatus);
          setUserProgress(finalProgress); // Update global context
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
    
    const props = {
      ...question.item,
      pointsForCorrect: question.item.pointsAwarded,
      id: question.item.id,
      title: `Frage ${currentQuestionIndex + 1} von ${questions.length}`,
      onAnswerSubmit: handleAnswerSubmit,
      isReadOnly: false,
      isActive: true,
      registerSubmit,
      unregisterSubmit,
      onValidityChange: handleFormValidity,
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
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="mt-4 text-destructive-foreground">{error}</p>
        </div>
      );
    }
    if (!bossInfo) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Fehler</DialogTitle>
            <DialogDescription>Boss-Informationen konnten nicht geladen werden.</DialogDescription>
          </DialogHeader>
          <div className="p-8">Boss-Informationen konnten nicht geladen werden.</div>
        </>
      );
    }

    switch (view) {
      case 'intro':
        return (
          <>
            <DialogHeader className="items-center text-center">
              <BossIcon icon={bossInfo.visual} className="h-20 w-20 text-primary mb-4" />
              <DialogTitle className="text-2xl">Ein Herausforderer erscheint!</DialogTitle>
              <DialogDescription className="text-lg italic text-muted-foreground p-4 border rounded-md">"{bossInfo.quote}"</DialogDescription>
            </DialogHeader>
            <div className="text-center mt-4">
              <p>Besiege <span className="font-bold">{bossInfo.name}</span>, um fortzufahren und einen Bonus zu erhalten!</p>
            </div>
            <DialogFooter className="mt-6">
              <EightbitButton onClick={() => setView('challenge')}>Herausforderung annehmen</EightbitButton>
            </DialogFooter>
          </>
        );
      case 'challenge':
        const currentQuestion = questions[currentQuestionIndex];
        const isAnswered = currentQuestion && (questionStatus[currentQuestion.item.id]?.attempts ?? 0) > 0;
        
        const handleSubmitClick = () => {
          if (!submitFn || isSubmitting) return;
          setIsSubmitting(true);
          submitFn();
        };

        return (
          <>
            <DialogHeader>
                <DialogTitle>Boss-Herausforderung: {bossInfo.name}</DialogTitle>
                <DialogDescription>
                  Beantworte die folgenden Fragen, um fortzufahren.
                </DialogDescription>
            </DialogHeader>
            <div className="p-4">{renderQuestion()}</div>
            <DialogFooter className="mt-4 p-4 border-t">
              {isAnswered ? (
                <EightbitButton onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Herausforderung beenden'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </EightbitButton>
              ) : (
                <EightbitButton onClick={handleSubmitClick} disabled={!isFormForSubmitValid || isSubmitting || !submitFn}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Antwort prüfen
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
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
                  <Trophy className="h-16 w-16 text-yellow-400 mb-4" />
                  <DialogTitle className="text-2xl font-bold text-yellow-400">Herausforderung gemeistert!</DialogTitle>
                  <DialogDescription className="mt-2 text-muted-foreground">Du hast {bossInfo.name} besiegt!</DialogDescription>
                </DialogHeader>
                <p className="mt-4 text-lg font-semibold">Bonus: +{bossInfo.bonusPoints} XP</p>
              </>
            ) : (
              <>
                <DialogHeader className="items-center text-center">
                  <XCircle className="h-16 w-16 text-destructive mb-4" />
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default BossChallengeDialog;
