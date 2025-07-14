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
            <path d="M1980 7280 l0 -620 295 0 295 0 0 620 0 620 -295 0 -295 0 0 -620z"/>
            <path d="M2980 7105 l0 -445 225 0 225 0 0 445 0 445 -225 0 -225 0 0 -445z"/>
            <path d="M3850 7105 l0 -445 225 0 225 0 0 445 0 445 -225 0 -225 0 0 -445z"/>
            <path d="M4650 6650 l0 -290 230 0 230 0 0 290 0 290 -230 0 -230 0 0 -290z"/>
            <path d="M5460 6210 l0 -290 225 0 225 0 0 290 0 290 -225 0 -225 0 0 -290z"/>
            <path d="M2420 5990 l0 -220 -220 0 -220 0 0 -665 0 -665 260 0 260 0 2 -222 3 -223 238 -3 237 -2 0 -225 0 -225 205 0 205 0 0 -665 0 -665 -205 0 -205 0 0 -885 0 -885 205 0 205 0 0 -220 0 -220 795 0 795 0 0 220 0 220 205 0 205 0 0 1550 0 1550 225 0 225 0 0 890 0 890 -225 0 -225 0 0 225 0 225 -545 0 -545 0 0 220 0 220 -940 0 -940 0 0 -220z"/>
        </g>
    </svg>
);

PointsIcon.displayName = "PointsIcon";
