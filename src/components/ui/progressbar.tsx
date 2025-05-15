import React from 'react';

interface ProgressBarProps {
    progress: number;
    sidebarWidth: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, sidebarWidth }) => {
    return (
        <>
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
            {/* Icons and Information Bar */}
            <div
                className="fixed left-0 w-full flex justify-between items-center z-1000"
                style={{ top: 'calc(15px + 8px)', width: `calc(100% - ${sidebarWidth}px)`, left: `${sidebarWidth}px` }}
            >
                {/* Level Text on the Left */}
                <div className="pl-4">
                    <span>Level 1</span>
                </div>

                {/* Icons Container */}
                <div className="flex pr-4 space-x-4">
                    {/* Points Icon */}
                    <div className="flex items-center">
                        <span>Points: 1234</span> {/* Replace with your points icon or dynamic data */}
                    </div>

                    {/* Settings Icon */}
                    <div className="flex items-center">
                        <span>bla</span> {/* Replace with settings icon */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProgressBar;
