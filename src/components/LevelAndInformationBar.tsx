
import React from 'react';
import { cn } from "@/lib/utils";
import type { Level } from '@/data/level-structure';
import { Zap, Shield } from 'lucide-react'; // Example icons

interface LevelAndInformationBarProps extends React.HTMLAttributes<HTMLDivElement> {
    sidebarWidth: number;
    totalPoints: number;
    currentLevel: Level | null;
}

const LevelAndInformationBar: React.FC<LevelAndInformationBarProps> = ({ sidebarWidth, totalPoints, currentLevel, className }) => {
    return (
        <div className={cn("w-full flex justify-between items-center z-50 pl-4 pr-4", className)}>
            <div>
                <span className="text-primary-foreground">{currentLevel ? currentLevel.title : 'Level'}</span>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                    <span className="text-primary-foreground font-semibold">Level {currentLevel?.id.split('-')[1] || 1}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-primary-foreground font-semibold">{totalPoints} km</span>
                </div>
            </div>
        </div>
    );
};

export default LevelAndInformationBar;
