
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
        <path d="M536 154H326V84H536V154Z" />
        <path d="M536 154H606V434H536V154Z" />
        <path d="M154 434H606V504H154V434Z" />
        <path d="M154 224H84V504H154V224Z" />
        <path d="M84 224H294V154H84V224Z" />
        <path d="M294 154L364 224L294 294V154Z" />
    </svg>
);

RepeatIcon.displayName = "RepeatIcon";
