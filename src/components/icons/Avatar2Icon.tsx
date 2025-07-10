
import type React from 'react';
import { cn } from "@/lib/utils";

interface Avatar2IconProps extends React.SVGProps<SVGSVGElement> {}

export const Avatar2Icon: React.FC<Avatar2IconProps> = ({ className, ...props }) => (
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
            <path d="M3944 7226 c-3 -4 -164 -165 -357 -358 -193 -193 -355 -354 -359 -358 l-8 -7 0 -1316 0 -1315 265 0 265 0 0 -580 0 -580 270 0 270 0 0 -570 0 -570 -270 0 -270 0 0 -270 0 -270 265 0 265 0 0 -270 0 -270 510 0 510 0 0 270 0 270 265 0 265 0 0 270 0 270 -270 0 -270 0 0 570 0 570 270 0 270 0 0 580 0 580 265 0 265 0 0 1315 0 1316 -8 7 c-4 4 -166 165 -359 358 -193 193 -355 354 -359 358 l-8 7 -6 -7z m716 -1766 l0 -1050 -265 0 -265 0 0 -310 0 -310 -270 0 -270 0 0 -835 0 -835 -255 0 -255 0 0 1095 0 1095 270 0 270 0 0 840 0 840 255 0 255 0 0 -1050z"/>
        </g>
    </svg>
);

Avatar2Icon.displayName = "Avatar2Icon";
