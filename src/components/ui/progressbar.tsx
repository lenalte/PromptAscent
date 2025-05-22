
import React from 'react';

interface ProgressBarProps {
    progress: number;
    sidebarWidth: number; // This prop might become less relevant if the progress bar is always full-width relative to its container
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    // sidebarWidth is removed from style calculation if progress bar is to fill its container
    return (
        <div
            className={`w-full h-[15px] flex items-center sidebar-background`}
            // style={{ width: `calc(100% - ${sidebarWidth}px)`, left: `${sidebarWidth}px` }} // Adjusted if it's inside a margin-controlled parent
        >
            <div
                className={`h-[60%] transition-all duration-300 ease-in-out bg-foreground`}
                style={{
                    width: `${progress}%`,
                }}
            />
        </div>
    );
};

export default ProgressBar;
