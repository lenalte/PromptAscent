
import type React from 'react';
import { cn } from "@/lib/utils";

interface Avatar4IconProps extends React.SVGProps<SVGSVGElement> {}

export const Avatar4Icon: React.FC<Avatar4IconProps> = ({ className, ...props }) => (
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
            <path d="M2100 6050 l0 -540 -270 0 -270 0 0 -260 0 -260 -540 0 -540 0 0 -270 0 -270 540 0 540 0 0 -525 0 -525 -270 0 -270 0 0 -540 0 -540 270 0 270 0 0 -265 0 -265 -540 0 -540 0 0 -270 0 -270 540 0 540 0 0 -540 0 -540 1040 0 1040 0 0 540 0 540 540 0 540 0 0 270 0 270 -540 0 -540 0 0 265 0 265 270 0 270 0 0 540 0 540 -270 0 -270 0 0 525 0 525 540 0 540 0 0 270 0 270 -540 0 -540 0 0 260 0 260 -270 0 -270 0 0 540z"/>
        </g>
    </svg>
);

Avatar4Icon.displayName = "Avatar4Icon";
