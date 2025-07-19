
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import type { Level } from '@/data/level-structure';
import { useUserProgress } from '@/context/UserProgressContext';
import { BossIcon } from '@/components/icons/BossIcon';
import { PointsIcon } from '@/components/icons/PointsIcon';
import { BackpackIcon } from '@/components/icons/BackpackIcon';
import { trackEvent } from "@/lib/gtagHelper";

interface LevelAndInformationBarProps extends React.HTMLAttributes<HTMLDivElement> {
    currentLevel: Level | null;
    onInventoryToggle: () => void;
}

const LevelAndInformationBar: React.FC<LevelAndInformationBarProps> = ({ currentLevel, className, onInventoryToggle }) => {
    const { userProgress } = useUserProgress();
    const totalPoints = userProgress?.totalPoints ?? 0;
    const activeBooster = userProgress?.activeBooster;
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!activeBooster || activeBooster.expiresAt < Date.now()) {
            setTimeLeft('');
            return;
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            const remaining = activeBooster.expiresAt - now;

            if (remaining <= 0) {
                setTimeLeft('');
                clearInterval(intervalId);
                // Optional: Force a re-fetch of user progress to clear the booster from the backend view
            } else {
                const minutes = Math.floor(remaining / 1000 / 60);
                const seconds = Math.floor((remaining / 1000) % 60);
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeBooster]);

    return (
        <>
            <div
                className={cn("w-full flex justify-between items-center z-50 pl-4 pr-4 pt-2", className)}
            >
                <div>
                    <span className="text-primary-foreground">{currentLevel ? currentLevel.title : 'Level'}</span>
                </div>

                <div className="flex items-center space-x-4 md:space-x-8">
                    {activeBooster && timeLeft && (
                        <div className="flex items-center gap-2 text-accent font-bold">
                            <BossIcon className="h-7 w-7" />
                            <span className="hidden sm:inline">{activeBooster.multiplier}x Boost</span>
                            <span className="text-sm">({timeLeft})</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <PointsIcon className="h-8 w-8 text-primary-foreground" />
                        <span className="text-primary-foreground">{totalPoints} Punkte</span>
                    </div>
                    <div className="hidden sm:flex items-center">
                        <button onClick={() => {
                            trackEvent({
                                action: "Backpack_Button_Clicked",
                                category: "UI",
                                label: "Inventory Toggle Button",
                              });
                              onInventoryToggle();
                              }} 
                              className="cursor-pointer">
                            <BackpackIcon className="h-8 w-8 text-primary-foreground" />
                        </button>
                    </div>
                </div>
            </div >
        </>
    );
};

export default LevelAndInformationBar;
