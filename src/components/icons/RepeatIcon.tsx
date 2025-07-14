
import type React from 'react';
import { cn } from "@/lib/utils";

interface RepeatIconProps extends React.SVGProps<SVGSVGElement> {}

export const RepeatIcon: React.FC<RepeatIconProps> = ({ className, ...props }) => (
    <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790.000000 790.000000"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <g
            transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
            fill="currentColor"
            stroke="none"
        >
            <path d="M5680 7370 l0 -530 -2260 0 -2260 0 0 -525 0 -525 -530 0 -530 0 0 -1060 0 -1060 530 0 530 0 0 1055 0 1055 2260 0 2260 0 0 -525 0 -525 530 0 530 0 2 263 3 262 263 3 262 2 0 260 0 260 265 0 265 0 0 530 0 530 -265 0 -265 0 0 265 0 265 -265 0 -265 0 0 265 0 265 -530 0 -530 0 0 -530z"/>
            <path d="M6740 3160 l0 -1040 -2260 0 -2260 0 0 525 0 525 -530 0 -530 0 -2 -262 -3 -263 -262 -3 -263 -2 0 -260 0 -260 -265 0 -265 0 0 -530 0 -530 265 0 265 0 0 -265 0 -265 265 0 265 0 0 -265 0 -265 530 0 530 0 0 530 0 530 2260 0 2260 0 0 510 0 510 530 0 530 0 0 1060 0 1060 -530 0 -530 0 0 -1040z"/>
        </g>
    </svg>
);

RepeatIcon.displayName = "RepeatIcon";
