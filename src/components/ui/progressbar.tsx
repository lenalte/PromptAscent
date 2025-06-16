
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    progress: number;
    sidebarWidth: number; // This prop might become less relevant if the progress bar is always full-width relative to its container
    progressText?: string; // Optional text to display on the progress bar
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, progressText }) => {
    // sidebarWidth is removed from style calculation if progress bar is to fill its container
    return (
        <div
            className={cn(
                "w-full h-[15px] flex items-center sidebar-background relative overflow-hidden py-[1px]" // Added py-[1px]
            )}
            // style={{ width: `calc(100% - ${sidebarWidth}px)`, left: `${sidebarWidth}px` }} // Adjusted if it's inside a margin-controlled parent
        >
            <div
                className="h-full transition-all duration-300 ease-in-out bg-foreground" // Inner bar should take full height
                style={{
                    width: `${progress}%`,
                }}
            />
            {progressText && (
                <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary-foreground select-none"
                    // Using text-primary-foreground which should be light/white for visibility.
                    // mix-blend-difference could also be used if more complex background variations are expected.
                    // e.g., className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference select-none"
                >
                    {progressText}
                </span>
            )}
        </div>
    );
};

export default ProgressBar;

