import type React from 'react';
import { cn } from "@/lib/utils";

interface LeaderboardIconProps extends React.SVGProps<SVGSVGElement> {}

export const LeaderboardIcon: React.FC<LeaderboardIconProps> = ({ className, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-8 w-8", className)}
        {...props}
    >
        <path d="M12 20V10"/>
        <path d="M18 20V4"/>
        <path d="M6 20V16"/>
    </svg>
);

LeaderboardIcon.displayName = "LeaderboardIcon";
