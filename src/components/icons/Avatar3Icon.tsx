
import type React from 'react';
import { cn } from "@/lib/utils";

interface Avatar3IconProps extends React.SVGProps<SVGSVGElement> {}

export const Avatar3Icon: React.FC<Avatar3IconProps> = ({ className, ...props }) => (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
        width="790.000000pt" height="790.000000pt" viewBox="0 0 790.000000 790.000000"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-8 w-8 shrink-0", className)}
        fill="currentColor"
        stroke="none"
        {...props}
    >
    <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)">
    <path d="M2190 7695 l0 -205 -205 0 -205 0 0 -1255 0 -1255 205 0 205 0 0
    -410 0 -410 -205 0 -205 0 0 -835 0 -835 415 0 415 0 0 -1040 0 -1040 -235 0
    -235 0 0 -205 0 -205 680 0 680 0 0 835 0 835 450 0 450 0 0 -835 0 -835 680
    0 680 0 0 205 0 205 -235 0 -235 0 0 1040 0 1040 415 0 415 0 0 835 0 835
    -205 0 -205 0 0 410 0 410 205 0 205 0 0 1255 0 1255 -205 0 -205 0 0 205 0
    205 -1760 0 -1760 0 0 -205z m3100 -1885 l0 -830 -205 0 -205 0 0 -190 0 -190
    -930 0 -930 0 0 190 0 190 -205 0 -205 0 0 830 0 830 1340 0 1340 0 0 -830z"/>
    <path d="M2950 6025 l0 -205 405 0 405 0 0 205 0 205 -405 0 -405 0 0 -205z"/>
    <path d="M4160 6025 l0 -205 405 0 405 0 0 205 0 205 -405 0 -405 0 0 -205z"/>
    </g>
    </svg>
);

Avatar3Icon.displayName = "Avatar3Icon";
