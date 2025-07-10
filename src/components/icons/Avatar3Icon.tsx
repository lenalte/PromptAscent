
import type React from 'react';
import { cn } from "@/lib/utils";

interface Avatar3IconProps extends React.SVGProps<SVGSVGElement> {}

export const Avatar3Icon: React.FC<Avatar3IconProps> = ({ className, ...props }) => (
    <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790.000000 790.000000"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-8 w-8 shrink-0", className)}
        fill="currentColor"
        stroke="none"
        {...props}
    >
        <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)">
            <path d="M2630 7630 l0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0 -1040 0 -1040 270 0 270 0 0 -270 0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0 -785 0 -785 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -775 0 -775 1580 0 1580 0 0 775 0 775 265 0 265 0 0 270 0 270 265 0 265 0 0 785 0 785 -270 0 -270 0 0 270 0 270 -265 0 -265 0 0 270 0 270 265 0 265 0 0 1040 0 1040 -270 0 -270 0 0 -270 0 -270 -265 0 -265 0 0 -1040 0 -1040 -1040 0 -1040 0 0 1040 0 1040 -265 0 -265 0 0 270 0 270 -270 0 -270 0 0 -270z m2350 -2660 l0 -775 -265 0 -265 0 0 775 0 775 265 0 265 0 0 -775z m-1040 -1575 l0 -785 -270 0 -270 0 0 785 0 785 270 0 270 0 0 -785z"/>
        </g>
    </svg>
);

Avatar3Icon.displayName = "Avatar3Icon";
