import React from 'react';


const LevelAndInformationBar: React.FC<{ sidebarWidth: number; points: number }> = ({ sidebarWidth, points }) => {
    return (
        <>
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
                        <span>{points} km</span> {/* Replace with your points icon or dynamic data */}
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

export default LevelAndInformationBar;