import type React from 'react';
import { cn } from "@/lib/utils";

interface LoginIconProps extends React.SVGProps<SVGSVGElement> {}

export const LoginIcon: React.FC<LoginIconProps> = ({ className, ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-6 w-6", className)}
        fill="currentColor"
        {...props}
    >
        <g transform="translate(231,184)">
            <path d="M0 0 C37.62 0 75.24 0 114 0 C114 25.41 114 50.82 114 77 C151.62 77 189.24 77 228 77 C228 102.08 228 127.16 228 153 C265.62 153 303.24 153 342 153 C342 190.95 342 228.9 342 268 C304.38 268 266.76 268 228 268 C228 293.41 228 318.82 228 345 C190.38 345 152.76 345 114 345 C114 370.08 114 395.16 114 421 C76.38 421 38.76 421 0 421 C0 370.51 0 320.02 0 268 C-64.02 268 -128.04 268 -194 268 C-194 230.05 -194 192.1 -194 153 C-129.98 153 -65.96 153 0 153 C0 102.51 0 52.02 0 0 Z " />
        </g>
        <g transform="translate(445,0)">
            <path d="M0 0 C64.35 0 128.7 0 195 0 C195 37.29 195 74.58 195 113 C232.29 113 269.58 113 308 113 C308 299.12 308 485.24 308 677 C270.71 677 233.42 677 195 677 C195 714.29 195 751.58 195 790 C130.65 790 66.3 790 0 790 C0 752.38 0 714.76 0 676 C64.02 676 128.04 676 194 676 C194 490.54 194 305.08 194 114 C129.98 114 65.96 114 0 114 C0 76.38 0 38.76 0 0 Z " />
        </g>
    </svg>
);

LoginIcon.displayName = "LoginIcon";
