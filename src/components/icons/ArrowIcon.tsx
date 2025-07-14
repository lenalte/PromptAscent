import type React from 'react';
import { cn } from "@/lib/utils";

interface ArrowIconProps extends React.SVGProps<SVGSVGElement> {}

export const ArrowIcon: React.FC<ArrowIconProps> = ({ className, ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-5 w-5", className)}
        fill="currentColor"
        {...props}
    >
        <g transform="translate(449,111)">
            <path d="M0 0 C37.62 0 75.24 0 114 0 C114 37.29 114 74.58 114 113 C151.62 113 189.24 113 228 113 C228 150.62 228 188.24 228 227 C265.29 227 302.58 227 341 227 C341 264.62 341 302.24 341 341 C303.71 341 266.42 341 228 341 C228 378.62 228 416.24 228 455 C190.38 455 152.76 455 114 455 C114 492.62 114 530.24 114 569 C76.38 569 38.76 569 0 569 C0 531.05 0 493.1 0 454 C37.29 454 74.58 454 113 454 C113 416.71 113 379.42 113 341 C-72.46 341 -257.92 341 -449 341 C-449 303.38 -449 265.76 -449 227 C-263.54 227 -78.08 227 113 227 C113 189.71 113 152.42 113 114 C75.71 114 38.42 114 0 114 C0 76.38 0 38.76 0 0 Z " />
        </g>
    </svg>
);

ArrowIcon.displayName = "ArrowIcon";
