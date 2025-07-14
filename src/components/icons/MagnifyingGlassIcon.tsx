
import type React from 'react';
import { cn } from "@/lib/utils";

interface MagnifyingGlassIconProps extends React.SVGProps<SVGSVGElement> {}

export const MagnifyingGlassIcon: React.FC<MagnifyingGlassIconProps> = ({ className, ...props }) => (
    <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-4 w-4", className)}
        fill="currentColor"
        stroke="none"
        {...props}
    >
        <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)">
            <path d="M1970 7405 l0 -495 -490 0 -490 0 0 -490 0 -490 -495 0 -495 0 0 -1485 0 -1485 495 0 495 0 0 -495 0 -495 490 0 490 0 0 -490 0 -490 1485 0 1485 0 0 490 0 490 490 0 490 0 0 -490 0 -490 495 0 495 0 0 -495 0 -495 495 0 495 0 0 495 0 495 -495 0 -495 0 0 495 0 495 -490 0 -490 0 0 490 0 490 490 0 490 0 0 1485 0 1485 -490 0 -490 0 0 490 0 490 -495 0 -495 0 0 495 0 495 -1485 0 -1485 0 0 -495z m2970 -990 l0 -495 490 0 490 0 0 -1480 0 -1480 -490 0 -490 0 0 -490 0 -490 -1480 0 -1480 0 0 490 0 490 -495 0 -495 0 0 1480 0 1480 493 2 492 3 3 493 2 492 1480 0 1480 0 0 -495z"/>
        </g>
    </svg>
);

MagnifyingGlassIcon.displayName = "MagnifyingGlassIcon";
