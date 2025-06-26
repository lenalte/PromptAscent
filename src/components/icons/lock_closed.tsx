import type React from 'react';
import { cn } from "@/lib/utils";

interface LockClosedIconProps extends React.SVGProps<SVGSVGElement> {}

export const LockClosedIcon: React.FC<LockClosedIconProps> = ({ className, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 690 690"
        fill="currentColor"
        className={cn("h-5 w-5", className)}
        {...props}
    >
        <path d="M420 52H499V131H420V52Z" />
        <path d="M196 52H275V131H196V52Z" />
        <path d="M197 13H500V92H197V13Z" />
        <path d="M156 131H235V252H156V131Z" />
        <path d="M460 131H539V252H460V131Z" />
        <path d="M609 410H688V519H609V410Z" />
        <path d="M3 410H82V519H3V410Z" />
        <path d="M82 252H610V331H82V252Z" />
        <path d="M82 598H610V677H82V598Z" />
        <path d="M3 331H159V410H3V331Z" />
        <path d="M3 519H159V598H3V519Z" />
        <path d="M532 331H688V410H532V331Z" />
        <path d="M532 519H688V598H532V519Z" />
    </svg>
);

LockClosedIcon.displayName = "LockClosedIcon";
