import type React from 'react';
import { cn } from "@/lib/utils";

interface ApplyIconProps extends React.SVGProps<SVGSVGElement> {}

export const ApplyIcon: React.FC<ApplyIconProps> = ({ className, ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-4 w-4", className)}
        fill="currentColor"
        {...props}
    >
        <g transform="translate(50,19)">
            <path d="M0 0 C210.87 0 421.74 0 639 0 C639 16.5 639 33 639 50 C655.83 50 672.66 50 690 50 C690 66.83 690 83.66 690 101 C706.5 101 723 101 740 101 C740 183.17 740 265.34 740 350 C632.75 350 525.5 350 415 350 C415 482.66 415 615.32 415 752 C366.82 752 318.64 752 269 752 C269 619.01 269 486.02 269 349 C285.5 349 302 349 319 349 C319 332.17 319 315.34 319 298 C441.1 298 563.2 298 689 298 C689 249.82 689 201.64 689 152 C672.5 152 656 152 639 152 C639 168.83 639 185.66 639 203 C428.13 203 217.26 203 0 203 C0 186.17 0 169.34 0 152 C-16.5 152 -33 152 -50 152 C-50 118.34 -50 84.68 -50 50 C-33.5 50 -17 50 0 50 C0 33.5 0 17 0 0 Z " />
        </g>
    </svg>
);

ApplyIcon.displayName = "ApplyIcon";
