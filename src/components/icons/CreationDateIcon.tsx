import type React from 'react';
import { cn } from "@/lib/utils";

interface CreationDateIconProps extends React.SVGProps<SVGSVGElement> {}

export const CreationDateIcon: React.FC<CreationDateIconProps> = ({ className, ...props }) => (
    <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-8 w-8", className)}
        {...props}
    >
        <g 
            transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
            fill="currentColor" 
            stroke="none"
        >
            <path d="M1210 7560 l0 -340 -205 0 -205 0 0 -240 0 -240 -340 0 -340 0 0 -345 0 -345 340 0 340 0 0 -580 0 -580 205 0 205 0 0 -1700 0 -1700 2740 0 2740 0 0 1700 0 1700 205 0 205 0 0 580 0 580 340 0 340 0 0 345 0 345 -340 0 -340 0 0 240 0 240 -205 0 -205 0 0 340 0 340 -2740 0 -2740 0 0 -340z m5380 -990 l0 -1700 -2740 0 -2740 0 0 1700 0 1700 2740 0 2740 0 0 -1700z m-4135 -2455 l-4 -203 -206 -2 -205 0 0 -205 0 -205 -225 0 -225 0 0 -200 0 -200 -205 0 -205 0 0 200 0 200 -225 0 -225 0 0 205 0 205 -205 0 -205 0 0 200 0 200 1300 0 1300 0 0 -197z"/>
            <path d="M5235 4313 c-2 -3 -5 -95 -5 -205 l0 -203 -190 0 -190 0 0 205 0 205 195 0 195 0 0 -202z"/>
            <path d="M1650 2590 l0 -580 545 0 545 0 0 580 0 580 -545 0 -545 0 0 -580z"/>
            <path d="M3050 2590 l0 -580 545 0 545 0 0 580 0 580 -545 0 -545 0 0 -580z"/>
            <path d="M4450 2590 l0 -580 545 0 545 0 0 580 0 580 -545 0 -545 0 0 -580z"/>
            <path d="M5850 2590 l0 -580 545 0 545 0 0 580 0 580 -545 0 -545 0 0 -580z"/>
        </g>
    </svg>
);

CreationDateIcon.displayName = "CreationDateIcon";