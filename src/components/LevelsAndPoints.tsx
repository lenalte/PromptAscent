import React from 'react';


const LevelsAndPoints: React.FC<{ level: number; points: number; sidebarWidth: number }> = ({ level, points, sidebarWidth }) => {
    return (
        <div
            style={{
                /* position: 'fixed', */
                top: '20px',
                width: `calc(100% - ${sidebarWidth}px)`,
                left: `${sidebarWidth}px`,
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 16px',
                zIndex: 1000,
            }}
        >
            <div style={{ textAlign: 'left' }}>Level: {level}</div>
            <div style={{ textAlign: 'right' }}>Points: {points}</div>
        </div>
    );
};

export default LevelsAndPoints;