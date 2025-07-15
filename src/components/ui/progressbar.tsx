
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    progress: number;
    progressText?: string; // Optional text to display on the progress bar
    backgroundClassName?: string; // Optional class for the background
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, progressText, backgroundClassName }) => {
    return (
        <div
            className={cn(
                "w-full h-[15px] flex items-center relative overflow-hidden",
                backgroundClassName || "sidebar-background" 
            )}
        >
            <div
                className="h-[11px] transition-all duration-300 ease-in-out bg-foreground" // Changed from h-full to h-[11px]
                style={{
                    width: `${progress}%`,
                }}
            />
            {progressText && (
                <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary-foreground select-none"
                >
                    {progressText}
                </span>
            )}
        </div>
    );
};

export default ProgressBar;
