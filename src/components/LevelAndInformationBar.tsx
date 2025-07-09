
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import type { Level } from '@/data/level-structure';
import { useUserProgress } from '@/context/UserProgressContext';
import { Zap } from 'lucide-react';

interface LevelAndInformationBarProps extends React.HTMLAttributes<HTMLDivElement> {
    currentLevel: Level | null;
}

const LevelAndInformationBar: React.FC<LevelAndInformationBarProps> = ({ currentLevel, className }) => {
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
                className={cn("w-full flex justify-between items-center z-50 pl-4 pr-4", className)}
            >
                <div>
                    <span className="text-primary-foreground">{currentLevel ? currentLevel.title : 'Level'}</span>
                </div>

                <div className="flex items-center space-x-4 md:space-x-8">
                    {activeBooster && timeLeft && (
                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                            <Zap className="h-5 w-5" />
                            <span className="hidden sm:inline">{activeBooster.multiplier}x Boost</span>
                            <span className="text-sm">({timeLeft})</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 790.000000 790.000000"
                            preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
                                fill="currentColor" stroke="none">
                                <path d="M4540 7180 l0 -390 -440 0 -440 0 0 -340 0 -340 -230 0 -230 0 0
-370 0 -370 -235 0 -235 0 0 -580 0 -580 -230 0 -230 0 0 -415 0 -415 700 0
700 0 0 -365 0 -365 -230 0 -230 0 0 -370 0 -370 -235 0 -235 0 0 -785 0 -785
315 0 315 0 0 390 0 390 230 0 230 0 0 370 0 370 220 0 220 0 0 380 0 380 230
0 230 0 0 380 0 380 230 0 230 0 0 385 0 385 225 0 225 0 0 220 0 220 -685 0
-685 0 0 365 0 365 225 0 225 0 0 375 0 375 225 0 225 0 0 750 0 750 -315 0
-315 0 0 -390z"/>
                            </g>
                        </svg>
                        <span className="text-primary-foreground">{totalPoints} Punkte</span>
                    </div>
                    <div className="hidden sm:flex items-center">
                        <span className="text-primary-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 790.000000 790.000000"
                                preserveAspectRatio="xMidYMid meet">
                                <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
                                    fill="currentColor" stroke="none">
                                    <path d="M3180 7375 l0 -195 -170 0 -170 0 0 -185 0 -185 -665 0 -665 0 0
-180 0 -180 -155 0 -155 0 0 -200 0 -200 -195 0 -195 0 0 -965 0 -965 -195 0
-195 0 0 -1130 0 -1130 195 0 195 0 0 -210 0 -210 350 0 350 0 0 -355 0 -355
170 0 170 0 0 -195 0 -195 2140 0 2140 0 0 195 0 195 155 0 155 0 0 355 0 355
350 0 350 0 0 210 0 210 165 0 165 0 0 1130 0 1130 -170 0 -170 0 -2 963 -3
962 -177 3 -178 2 0 200 0 200 -165 0 -165 0 0 180 0 180 -680 0 -680 0 0 195
0 195 -170 0 -170 0 0 185 0 185 -780 0 -780 0 0 -195z m1150 -380 l0 -185
-370 0 -370 0 0 185 0 185 370 0 370 0 0 -185z m1720 -1555 l0 -980 -170 0
-170 0 0 -170 0 -170 -485 0 -485 0 0 335 0 335 -725 0 -725 0 0 -335 0 -335
-525 0 -525 0 0 170 0 170 -170 0 -170 0 0 980 0 980 2075 0 2075 0 0 -980z
m-4540 -555 l0 -1135 -155 0 -155 0 0 1135 0 1135 155 0 155 0 0 -1135z m5228
-2 l2 -1133 -150 0 -150 0 0 1135 0 1136 148 -3 147 -3 3 -1132z m-2388 -808
l0 -325 -335 0 -335 0 0 325 0 325 335 0 335 0 0 -325z m-2150 -175 l0 -170
545 0 545 0 0 -185 0 -184 148 -3 147 -3 3 -192 2 -193 395 0 395 0 0 195 0
195 180 0 180 0 0 185 0 185 545 0 545 0 0 170 0 170 110 0 110 0 0 -1475 0
-1475 -155 0 -155 0 0 -195 0 -195 -1750 0 -1750 0 0 195 0 195 -170 0 -170 0
0 1475 0 1475 150 0 150 0 0 -170z m-1002 -907 l2 -753 -195 0 -195 0 0 755 0
755 193 -2 192 -3 3 -752z m5882 2 l0 -755 -155 0 -155 0 0 755 0 755 155 0
155 0 0 -755z"/>
                                </g>
                            </svg>
                        </span>
                    </div>
                </div>
            </div >
        </>
    );
};

export default LevelAndInformationBar;
