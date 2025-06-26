import type React from 'react';
import { cn } from "@/lib/utils";

interface LockClosedIconProps extends React.SVGProps<SVGSVGElement> {}

export const LockClosedIcon: React.FC<LockClosedIconProps> = ({ className, ...props }) => (
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
        className={cn("h-5 w-5", className)}
        {...props}
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

LockClosedIcon.displayName = "LockClosedIcon";
