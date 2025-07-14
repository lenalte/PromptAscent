
import type React from 'react';
import { cn } from "@/lib/utils";

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

export const CheckIcon: React.FC<CheckIconProps> = ({ className, ...props }) => (
    <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="790pt"
        height="790pt"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-12 w-12", className)}
        {...props}
    >
        <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
           fill="currentColor" stroke="none">
            <path d="M608 7598 l-3 -303 -302 -3 -303 -2 0 -3340 0 -3340 303 -2 302 -3 3 -302 2 -303 3340 0 3340 0 2 303 3 302 302 3 303 2 0 3340 0 3340 -302 2 -303 3 -3 303 -2 302 -3340 0 -3340 0 -2 -302z m6682 -3648 l0 -3340 -3340 0 -3340 0 0 3340 0 3340 3340 0 3340 0 0 -3340z"/>
            <path d="M5780 6225 l0 -305 -305 0 -305 0 0 -305 0 -305 -305 0 -305 0 0 -300 0 -300 -300 0 -300 0 0 -305 0 -305 -305 0 -305 0 0 -300 0 -300 -275 0 -275 0 0 300 0 300 -305 0 -305 0 0 305 0 305 -300 0 -300 0 0 -305 0 -305 -275 0 -275 0 2 -302 3 -303 303 -3 302 -2 0 -300 0 -300 305 0 305 0 0 -305 0 -305 300 0 300 0 0 -355 0 -355 305 0 305 0 0 355 0 355 303 2 302 3 3 303 2 302 300 0 300 0 0 300 0 300 245 0 245 0 0 305 0 305 305 0 305 0 0 305 0 305 300 0 300 0 0 300 0 300 305 0 305 0 0 305 0 305 -305 0 -305 0 0 305 0 305 -300 0 -300 0 0 -305z"/>
        </g>
    </svg>
);

CheckIcon.displayName = "CheckIcon";
