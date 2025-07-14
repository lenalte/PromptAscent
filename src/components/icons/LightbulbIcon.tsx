
import type React from 'react';
import { cn } from "@/lib/utils";

interface LightbulbIconProps extends React.SVGProps<SVGSVGElement> {}

export const LightbulbIcon: React.FC<LightbulbIconProps> = ({ className, ...props }) => (
    <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="790.000000pt"
        height="790.000000pt"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <g
            transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
            fill="currentColor"
            stroke="none"
        >
            <path d="M2610 7450 l0 -450 -445 0 -445 0 0 -445 0 -445 -450 0 -450 0 0 -1345 0 -1345 448 -2 447 -3 3 -447 2 -448 445 0 445 0 0 -450 0 -450 1345 0 1345 0 0 450 0 450 445 0 445 0 2 448 3 447 448 3 447 2 0 1345 0 1345 -450 0 -450 0 0 445 0 445 -445 0 -445 0 0 450 0 450 -1345 0 -1345 0 0 -450z m2690 -895 l0 -445 445 0 445 0 0 -1345 0 -1345 -445 0 -445 0 0 -450 0 -450 -1345 0 -1345 0 0 450 0 450 -445 0 -445 0 0 1345 0 1345 445 0 445 0 0 445 0 445 1345 0 1345 0 0 -445z"/>
            <path d="M3060 450 l0 -450 895 0 895 0 0 450 0 450 -895 0 -895 0 0 -450z"/>
        </g>
    </svg>
);

LightbulbIcon.displayName = "LightbulbIcon";
