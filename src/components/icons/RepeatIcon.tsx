
import type React from 'react';
import { cn } from "@/lib/utils";

interface RepeatIconProps extends React.SVGProps<SVGSVGElement> {}

export const RepeatIcon: React.FC<RepeatIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <path d="M572.874 109.078H659V195.155H572.874V109.078Z" />
        <path d="M32 493.845H118.126V579.922H32V493.845Z" />
        <path d="M529.81 66.0388H615.937V152.116H529.81V66.0388Z" />
        <path d="M32 195.155H118.126V281.233H32V195.155Z" />
        <path d="M572.874 410.349H659V496.427H572.874V410.349Z" />
        <path d="M32 281.233H118.126V367.311H32V281.233Z" />
        <path d="M572.874 324.272H659V410.349H572.874V324.272Z" />
        <path d="M529.81 152.116H615.937V238.194H529.81V152.116Z" />
        <path d="M75.0632 450.806H161.19V536.884H75.0632V450.806Z" />
        <path d="M75.0632 536.884H161.19V622.961H75.0632V536.884Z" />
        <path d="M486.747 23H572.874V109.078H486.747V23Z" />
        <path d="M486.747 195.155H572.874V281.233H486.747V195.155Z" />
        <path d="M118.126 407.767H204.253V493.845H118.126V407.767Z" />
        <path d="M118.126 579.922H204.253V666H118.126V579.922Z" />
        <path d="M118.126 109.078H572.874V195.155H118.126V109.078Z" />
        <path d="M118.126 493.845H572.874V579.922H118.126V493.845Z" />
    </svg>
);

RepeatIcon.displayName = "RepeatIcon";
