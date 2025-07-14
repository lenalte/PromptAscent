import type React from 'react';
import { cn } from "@/lib/utils";

interface SimpleArrowDownIconProps extends React.SVGProps<SVGSVGElement> {}

export const SimpleArrowDownIcon: React.FC<SimpleArrowDownIconProps> = ({ className, ...props }) => (
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="790"
        height="790"
        viewBox="0 0 790 790"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-4 w-4", className)}
        fill="currentColor"
        {...props}
    >
        <g>
            <path d="M0 0 C52.14 0 104.28 0 158 0 C158 52.14 158 104.28 158 158 C105.86 158 53.72 158 0 158 C0 105.86 0 53.72 0 0 Z " transform="translate(316,474)"/>
            <path d="M0 0 C52.14 0 104.28 0 158 0 C158 52.14 158 104.28 158 158 C105.86 158 53.72 158 0 158 C0 105.86 0 53.72 0 0 Z " transform="translate(474,316)"/>
            <path d="M0 0 C52.14 0 104.28 0 158 0 C158 52.14 158 104.28 158 158 C105.86 158 53.72 158 0 158 C0 105.86 0 53.72 0 0 Z " transform="translate(158,316)"/>
            <path d="M0 0 C52.14 0 104.28 0 158 0 C158 52.14 158 104.28 158 158 C105.86 158 53.72 158 0 158 C0 105.86 0 53.72 0 0 Z " transform="translate(632,158)"/>
            <path d="M0 0 C52.14 0 104.28 0 158 0 C158 52.14 158 104.28 158 158 C105.86 158 53.72 158 0 158 C0 105.86 0 53.72 0 0 Z " transform="translate(0,158)"/>
        </g>
    </svg>
);

SimpleArrowDownIcon.displayName = "SimpleArrowDownIcon";
