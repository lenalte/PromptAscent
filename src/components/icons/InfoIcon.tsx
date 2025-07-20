import type React from 'react';
import { cn } from "@/lib/utils";

interface InfoIconProps extends React.SVGProps<SVGSVGElement> {}

export const InfoIcon: React.FC<InfoIconProps> = ({ className, ...props }) => (
    <svg 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 790 790"
        fill="currentColor"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <g>
            <path d="M0 0 C30.69 0 61.38 0 93 0 C93 198.66 93 397.32 93 602 C291.66 602 490.32 602 695 602 C695 632.69 695 663.38 695 695 C496.01 695 297.02 695 92 695 C92 664.64 92 634.28 92 603 C61.64 603 31.28 603 0 603 C0 404.01 0 205.02 0 0 Z" transform="translate(1,95)"/>
            <path d="M0 0 C198.99 0 397.98 0 603 0 C603 30.36 603 60.72 603 92 C633.36 92 663.72 92 695 92 C695 290.99 695 489.98 695 695 C664.31 695 633.62 695 602 695 C602 496.34 602 297.68 602 93 C403.34 93 204.68 93 0 93 C0 62.31 0 31.62 0 0 Z" transform="translate(93,0)"/>
            <path d="M0 0 C32.01 0 64.02 0 97 0 C97 92.07 97 184.14 97 279 C64.99 279 32.98 279 0 279 C0 186.93 0 94.86 0 0 Z" transform="translate(346,333)"/>
            <path d="M0 0 C32.01 0 64.02 0 97 0 C97 30.69 97 61.38 97 93 C64.99 93 32.98 93 0 93 C0 62.31 0 31.62 0 0 Z" transform="translate(346,175)"/>
        </g>
    </svg>
);

InfoIcon.displayName = "InfoIcon";
