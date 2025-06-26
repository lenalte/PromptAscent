
import type React from 'react';
import { cn } from "@/lib/utils";

interface MagnifyingGlassIconProps extends React.SVGProps<SVGSVGElement> {}

export const MagnifyingGlassIcon: React.FC<MagnifyingGlassIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <path d="M94.625 93.625H178.25V177.25H94.625V93.625Z" />
        <path d="M11 177.25H94.625V260.875H11V177.25Z" />
        <path d="M11 260.875H94.625V344.5H11V260.875Z" />
        <path d="M11 344.5H94.625V428.125H11V344.5Z" />
        <path d="M512.75 177.25H596.375V260.875H512.75V177.25Z" />
        <path d="M512.75 260.875H596.375V344.5H512.75V260.875Z" />
        <path d="M512.75 344.5H596.375V428.125H512.75V344.5Z" />
        <path d="M178.25 10H261.875V93.625H178.25V10Z" />
        <path d="M261.875 10H345.5V93.625H261.875V10Z" />
        <path d="M345.5 10H429.125V93.625H345.5V10Z" />
        <path d="M178.25 511.75H261.875V595.375H178.25V511.75Z" />
        <path d="M261.875 511.75H345.5V595.375H261.875V511.75Z" />
        <path d="M345.5 511.75H429.125V595.375H345.5V511.75Z" />
        <path d="M429.125 93.625H512.75V177.25H429.125V93.625Z" />
        <path d="M94.625 428.125H178.25V511.75H94.625V428.125Z" />
        <path d="M429.125 428.125H512.75V511.75H429.125V428.125Z" />
        <path d="M512.75 511.75H596.375V595.375H512.75V511.75Z" />
        <path d="M596.375 595.375H680V679H596.375V595.375Z" />
    </svg>
);

MagnifyingGlassIcon.displayName = "MagnifyingGlassIcon";
