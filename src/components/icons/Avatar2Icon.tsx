
import type React from 'react';
import { cn } from "@/lib/utils";

interface Avatar2IconProps extends React.SVGProps<SVGSVGElement> {}

export const Avatar2Icon: React.FC<Avatar2IconProps> = ({ className, ...props }) => (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
        width="790.000000pt" height="790.000000pt" viewBox="0 0 790.000000 790.000000"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-8 w-8 shrink-0", className)}
        fill="currentColor"
        stroke="none"
        {...props}
    >
    <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)">
    <path d="M3100 7560 l0 -340 -310 0 -310 0 0 -170 0 -170 165 0 165 0 0 -170
    0 -170 -330 0 -330 0 0 -1150 0 -1150 165 0 165 0 0 -165 0 -165 310 0 310 0
    0 -160 0 -160 -340 0 -340 0 0 -160 0 -160 -135 0 -135 0 0 -825 0 -825 170 0
    170 0 0 660 0 660 135 0 135 0 0 -1300 0 -1300 -140 0 -140 0 0 -170 0 -170
    495 0 495 0 2 808 3 807 473 3 472 2 0 -810 0 -810 495 0 495 0 0 170 0 170
    -138 0 -139 0 -6 952 c-4 524 -7 1109 -7 1301 l0 347 145 0 145 0 0 -660 0
    -660 170 0 170 0 0 825 0 825 -145 0 -145 0 0 160 0 160 -340 0 -340 0 0 160
    0 160 320 0 320 0 0 165 0 165 165 0 165 0 0 1150 0 1150 -165 0 -165 0 0 170
    0 170 -160 0 -160 0 0 170 0 170 -650 0 -650 0 0 170 0 170 -170 0 -170 0 0
    170 0 170 -180 0 -180 0 0 -340z m2310 -2335 l0 -975 -1460 0 -1460 0 0 975 0
    975 1460 0 1460 0 0 -975z"/>
    <path d="M2810 5225 l0 -335 325 0 325 0 0 335 0 335 -325 0 -325 0 0 -335z"/>
    <path d="M4450 5225 l0 -335 325 0 325 0 0 335 0 335 -325 0 -325 0 0 -335z"/>
    </g>
    </svg>
);

Avatar2Icon.displayName = "Avatar2Icon";
