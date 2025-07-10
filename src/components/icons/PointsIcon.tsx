import type React from 'react';
import { cn } from "@/lib/utils";

interface PointsIconProps extends React.SVGProps<SVGSVGElement> {}

export const PointsIcon: React.FC<PointsIconProps> = ({ className, ...props }) => (
    <svg 
        version="1.0" 
        xmlns="http://www.w3.org/2000/svg" 
        className={cn("h-8 w-8 text-primary-foreground", className)}
        viewBox="0 0 790.000000 790.000000"
        preserveAspectRatio="xMidYMid meet"
        {...props}
    >
        <g 
            transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
            fill="currentColor" 
            stroke="none"
        >
            <path d="M4540 7180 l0 -390 -440 0 -440 0 0 -340 0 -340 -230 0 -230 0 0
-370 0 -370 -235 0 -235 0 0 -580 0 -580 -230 0 -230 0 0 -415 0 -415 700 0
700 0 0 -365 0 -365 -230 0 -230 0 0 -370 0 -370 -235 0 -235 0 0 -785 0 -785
315 0 315 0 0 390 0 390 230 0 230 0 0 370 0 370 220 0 220 0 0 380 0 380 230
0 230 0 0 380 0 380 230 0 230 0 0 385 0 385 225 0 225 0 0 220 0 220 -685 0
-685 0 0 365 0 365 225 0 225 0 0 375 0 375 225 0 225 0 0 750 0 750 -315 0
-315 0 0 -390z"/>
        </g>
    </svg>
);

PointsIcon.displayName = "PointsIcon";
