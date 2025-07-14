
import type React from 'react';
import { cn } from "@/lib/utils";

interface PassIconProps extends React.SVGProps<SVGSVGElement> {}

export const PassIcon: React.FC<PassIconProps> = ({ className, ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-4 w-4", className)}
        fill="currentColor"
        {...props}
    >
        <g transform="translate(343,46)">
            <path d="M0 0 C33.99 0 67.98 0 103 0 C103 33.66 103 67.32 103 102 C115.21 102 127.42 102 140 102 C140 152.82 140 203.64 140 256 C173.99 256 207.98 256 243 256 C243 282.07 243 308.14 243 335 C259.5 335 276 335 293 335 C293 308.93 293 282.86 293 256 C309.83 256 326.66 256 344 256 C344 227.95 344 199.9 344 171 C377.99 171 411.98 171 447 171 C447 288.15 447 405.3 447 526 C186.3 526 -74.4 526 -343 526 C-343 408.85 -343 291.7 -343 171 C-309.01 171 -275.02 171 -240 171 C-240 199.05 -240 227.1 -240 256 C-223.17 256 -206.34 256 -189 256 C-189 282.07 -189 308.14 -189 335 C-172.5 335 -156 335 -139 335 C-139 308.93 -139 282.86 -139 256 C-105.01 256 -71.02 256 -36 256 C-36 205.18 -36 154.36 -36 102 C-24.12 102 -12.24 102 0 102 C0 68.34 0 34.68 0 0 Z" />
        </g>
        <g transform="translate(0,641)">
            <path d="M0 0 C260.7 0 521.4 0 790 0 C790 33.99 790 67.98 790 103 C529.3 103 268.6 103 0 103 C0 69.01 0 35.02 0 0 Z" />
        </g>
    </svg>
);

PassIcon.displayName = "PassIcon";
