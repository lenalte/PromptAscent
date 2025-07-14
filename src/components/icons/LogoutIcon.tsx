
import type React from 'react';
import { cn } from "@/lib/utils";

interface LogoutIconProps extends React.SVGProps<SVGSVGElement> {}

export const LogoutIcon: React.FC<LogoutIconProps> = ({ className, ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-6 w-6", className)}
        fill="currentColor"
        {...props}
    >
        <g transform="translate(416,184)">
            <path d="M0 0 C37.95 0 75.9 0 115 0 C115 25.41 115 50.82 115 77 C152.62 77 190.24 77 229 77 C229 102.08 229 127.16 229 153 C266.29 153 303.58 153 342 153 C342 190.95 342 228.9 342 268 C304.71 268 267.42 268 229 268 C229 293.41 229 318.82 229 345 C191.38 345 153.76 345 115 345 C115 370.08 115 395.16 115 421 C77.05 421 39.1 421 0 421 C0 370.51 0 320.02 0 268 C-64.35 268 -128.7 268 -195 268 C-195 230.05 -195 192.1 -195 153 C-130.65 153 -66.3 153 0 153 C0 102.51 0 52.02 0 0 Z" />
        </g>
        <g transform="translate(146,0)">
            <path d="M0 0 C64.68 0 129.36 0 196 0 C196 37.62 196 75.24 196 114 C131.65 114 67.3 114 1 114 C1 299.46 1 484.92 1 676 C65.35 676 129.7 676 196 676 C196 713.62 196 751.24 196 790 C131.32 790 66.64 790 0 790 C0 752.71 0 715.42 0 677 C-37.29 677 -74.58 677 -113 677 C-113 490.88 -113 304.76 -113 113 C-75.71 113 -38.42 113 0 113 C0 75.71 0 38.42 0 0 Z" />
        </g>
    </svg>
);

LogoutIcon.displayName = "LogoutIcon";
