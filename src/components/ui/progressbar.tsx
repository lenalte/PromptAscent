import React from 'react';

interface ProgressBarProps {
    progress: number;
    sidebarWidth: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, sidebarWidth }) => {
    return (
        <div
            className={`fixed top-0 left-0 w-full h-[15px] z-1000 flex items-center sidebar-background`}
            style={{ width: `calc(100% - ${sidebarWidth}px)`, left: `${sidebarWidth}px` }}
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
