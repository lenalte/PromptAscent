
import React from 'react';
import { cn } from "@/lib/utils";
import type { Level } from '@/data/level-structure';
import { Award } from 'lucide-react';

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
            <div className="flex items-center gap-2">
                <span className="text-primary-foreground font-semibold">{totalPoints} Pts</span>
                <Award className="h-5 w-5 text-yellow-400" />
            </div>
        </div>
    );
};

export default LevelAndInformationBar;
