"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { CloseIcon } from './icons/closeIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProgress } from '@/context/UserProgressContext';
import { AvatarDisplay } from './AvatarDisplay';
import { getLeaderboardData, type LeaderboardEntry } from '@/services/userProgressService';
import { getLevelForLessonId, LEVELS } from '@/data/level-structure';
import { PointsIcon } from './icons/PointsIcon';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import ProgressBar from './ui/progressbar';
import { getLessonSummaries, type LessonSummary } from '@/data/lessons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LockClosedIcon } from './icons/lock_closed';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
  selectedSummaryLessonId: string | null;
  onSummarySelectHandled: () => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-[#3B0099]">
        <div className="flex-shrink-0 w-8 h-8">{icon}</div>
        <div className="flex flex-col">
            <span className="text-xl font-bold">{value}</span>
            <span className="text-xs text-white/70">{label}</span>
        </div>
    </div>
);


const Inventory: React.FC<InventoryProps> = ({ isOpen, onClose, sidebarWidth, selectedSummaryLessonId, onSummarySelectHandled }) => {
  const { userProgress, currentUser } = useUserProgress();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("allgemein");
  const [summaries, setSummaries] = useState<LessonSummary[]>([]);
  const [unlockedSummaries, setUnlockedSummaries] = useState<LessonSummary[]>([]);
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchDataForTab() {
        if (!isOpen) return;

        if (activeTab === "allgemein") {
            try {
                const data = await getLeaderboardData();
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
                setLeaderboard([]);
            }
        } else if (activeTab === "zusammenfassungen") {
            try {
                const allSummaries = await getLessonSummaries();
                setSummaries(allSummaries);
            } catch (error) {
                console.error("Failed to fetch summaries:", error);
                setSummaries([]);
            }
        }
    }
    fetchDataForTab();
  }, [isOpen, activeTab]);
  
  useEffect(() => {
    if (summaries.length > 0 && userProgress?.completedLessons) {
        const filtered = summaries.filter(s => userProgress.completedLessons.includes(s.id));
        setUnlockedSummaries(filtered);
    }
  }, [summaries, userProgress?.completedLessons]);

  useEffect(() => {
    if (leaderboard.length > 0 && currentUser) {
      const rank = leaderboard.findIndex(entry => entry.userId === currentUser.uid) + 1;
      setUserRank(rank > 0 ? rank : null);
    }
  }, [leaderboard, currentUser]);
  
  useEffect(() => {
    if (selectedSummaryLessonId) {
        setActiveTab("zusammenfassungen");
        setAccordionValue(selectedSummaryLessonId);
        onSummarySelectHandled(); // Reset the selection in the parent
    }
  }, [selectedSummaryLessonId, onSummarySelectHandled]);


  if (!isOpen) {
    return null;
  }
  
  const currentLevel = userProgress?.currentLessonId ? getLevelForLessonId(userProgress.currentLessonId) : LEVELS[0];
  const completedInLevel = currentLevel?.lessonIds.filter(id => userProgress?.completedLessons.includes(id)).length ?? 0;
  const totalInLevel = currentLevel?.lessonIds.length ?? 1;
  const levelProgressPercentage = totalInLevel > 0 ? (completedInLevel / totalInLevel) * 100 : 0;
  
  const creationDate = currentUser?.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-';

  const renderSummaryWithBold = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, lineIndex) => {
        if (line.trim().startsWith('# ')) {
            const headingText = line.trim().substring(2);
            return (
                <h4 key={`line-${lineIndex}`} className="text-lg font-semibold mt-4 mb-2">
                    {headingText}
                </h4>
            );
        }

        const parts = line.split(/(\*\*.*?\*\*)/g).filter(part => part);
        return (
            <p key={`line-${lineIndex}`} className="mb-2">
                {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </p>
        );
    });
  };

  const tabTriggerClasses = "relative inline-block w-full px-4 py-2 text-center no-underline transition-all duration-100 group";
  const tabBorderSpanClasses = "pointer-events-none absolute border-solid";

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-50 sidebar-background"
      style={{ left: `${sidebarWidth}px` }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label="Close inventory"
      >
        <CloseIcon className="h-6 w-6" />
      </button>
      <div className="px-28 py-8 text-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-8 p-0 bg-transparent border-none">
          <TabsTrigger value="allgemein" className={cn(tabTriggerClasses, activeTab === 'allgemein' ? "!text-white" : "text-custom-foreground hover:!text-white")}>
                <div className="relative z-20">Allgemein</div>
                <span className={cn(tabBorderSpanClasses, "border-custom-foreground left-0 right-0 -top-[6px] h-[calc(100%+12px)] border-t-[6px] border-b-[6px]")}></span>
                <span className={cn(tabBorderSpanClasses, "border-custom-foreground top-0 bottom-0 -left-[6px] w-[calc(100%+12px)] border-l-[6px] border-r-[6px]")}></span>
                <div className={cn("absolute inset-0 z-10 group-hover:bg-custom-foreground", activeTab === 'allgemein' ? 'bg-custom-foreground' : 'bg-background')}></div>
            </TabsTrigger>
            <TabsTrigger value="zusammenfassungen" className={cn(tabTriggerClasses, activeTab === 'zusammenfassungen' ? "!text-white" : "text-custom-foreground hover:!text-white")}>
                <div className="relative z-20">Zusammenfassungen</div>
                <span className={cn(tabBorderSpanClasses, "border-custom-foreground left-0 right-0 -top-[6px] h-[calc(100%+12px)] border-t-[6px] border-b-[6px]")}></span>
                <span className={cn(tabBorderSpanClasses, "border-custom-foreground top-0 bottom-0 -left-[6px] w-[calc(100%+12px)] border-l-[6px] border-r-[6px]")}></span>
                <div className={cn("absolute inset-0 z-10 group-hover:bg-custom-foreground", activeTab === 'zusammenfassungen' ? 'bg-custom-foreground' : 'bg-background')}></div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="allgemein">
            <div className="mt-8 p-4 rounded-lg">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center justify-center flex-shrink-0 w-1/3 gap-4">
                        {userProgress?.avatarId && (
                           <AvatarDisplay avatarId={userProgress.avatarId} className="h-40 w-40 text-[hsl(var(--sidebar-accent-foreground))]" />
                        )}
                    </div>
                    <div className="flex flex-col w-2/3 gap-4">
                        <InfoCard 
                            icon={<PointsIcon className="w-full h-full" />}
                            value={userProgress?.totalPoints ?? 0}
                            label="Punkte"
                        />
                         <InfoCard 
                            icon={<LeaderboardIcon className="w-full h-full" />}
                            value={userRank ?? '-'}
                            label="Leaderboard platz"
                        />
                         <InfoCard 
                            icon={<CheckIcon className="w-full h-full" />}
                            value={userProgress?.completedLessons.length ?? 0}
                            label="erledigte Lektionen"
                        />
                    </div>
                </div>
                <div className="w-full mt-4 text-left">
                    <h4 className="text-lg font-semibold">Level: {currentLevel?.title ?? 'Basics'}</h4>
                    <ProgressBar progress={levelProgressPercentage} backgroundClassName="bg-background" />
                    <div className="flex items-center justify-between mt-2">
                        <h3 className="text-xl font-bold">{userProgress?.username}</h3>
                        <p className="text-sm text-white/80">Beigetreten am {creationDate}</p>
                    </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4">Deine Badges:</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center p-4">
                        <LockClosedIcon className="h-16 w-16 text-[hsl(var(--foreground))]" />
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </TabsContent>
          <TabsContent value="zusammenfassungen">
            <div className="p-4 mt-4 rounded-lg max-h-[calc(100vh-12rem)] overflow-y-auto hide-scrollbar">
              {unlockedSummaries.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" value={accordionValue} onValueChange={setAccordionValue}>
                    {unlockedSummaries.map((summary) => (
                        <AccordionItem key={summary.id} value={summary.id} className="border-b border-[hsl(var(--foreground))]">
                            <AccordionTrigger className="text-white hover:text-gray-300 text-3xl font-bold hover:no-underline">
                                {summary.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/80 pb-4 px-4">
                                {renderSummaryWithBold(summary.summary)}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
              ) : (
                <p className="mt-2 text-white/80">
                  Schliesse Lektionen ab, um hier ihre Zusammenfassungen freizuschalten.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;
