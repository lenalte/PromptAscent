
"use client";

import React, { useEffect, useState } from 'react';
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

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
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


const Inventory: React.FC<InventoryProps> = ({ isOpen, onClose, sidebarWidth }) => {
  const { userProgress, currentUser } = useUserProgress();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      getLeaderboardData().then(data => {
        setLeaderboard(data);
        const rank = data.findIndex(entry => entry.userId === currentUser?.uid);
        setUserRank(rank !== -1 ? rank + 1 : null);
      });
    }
  }, [isOpen, currentUser]);


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

  const tabTriggerBaseClasses = "relative inline-block w-full px-4 py-2 text-center no-underline transition-all duration-100 group";
  const tabBorderSpanClasses = "pointer-events-none absolute border-solid border-custom-foreground";

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
        <Tabs defaultValue="allgemein" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-4 p-0 bg-transparent border-none">
            <TabsTrigger value="allgemein" className={cn(tabTriggerBaseClasses, "data-[state=active]:text-white data-[state=inactive]:text-custom-foreground")}>
                <div className="relative z-20">Allgemein</div>
                <span className={cn(tabBorderSpanClasses, "left-0 right-0 -top-[6px] h-[calc(100%+12px)] border-t-[6px] border-b-[6px] z-10")}></span>
                <span className={cn(tabBorderSpanClasses, "top-0 bottom-0 -left-[6px] w-[calc(100%+12px)] border-l-[6px] border-r-[6px] z-10")}></span>
                <div className="absolute inset-0 -z-10 data-[state=inactive]:bg-background group-hover:bg-background data-[state=active]:bg-custom-foreground"></div>
            </TabsTrigger>
            <TabsTrigger value="zusammenfassungen" className={cn(tabTriggerBaseClasses, "data-[state=active]:text-white data-[state=inactive]:text-custom-foreground")}>
                <div className="relative z-20">Zusammenfassungen</div>
                <span className={cn(tabBorderSpanClasses, "left-0 right-0 -top-[6px] h-[calc(100%+12px)] border-t-[6px] border-b-[6px] z-10")}></span>
                <span className={cn(tabBorderSpanClasses, "top-0 bottom-0 -left-[6px] w-[calc(100%+12px)] border-l-[6px] border-r-[6px] z-10")}></span>
                <div className="absolute inset-0 -z-10 data-[state=inactive]:bg-background group-hover:bg-background data-[state=active]:bg-custom-foreground"></div>
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
            </div>
          </TabsContent>
          <TabsContent value="zusammenfassungen">
            <div className="p-4 mt-4 rounded-lg">
              <h3 className="text-lg font-semibold">Zusammenfassungen</h3>
              <p className="mt-2 text-white/80">Hier werden deine gesammelten Zusammenfassungen angezeigt.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;
