import type React from 'react';
import { cn } from "@/lib/utils";

interface LogoutIconProps extends React.SVGProps<SVGSVGElement> {}

export const LogoutIcon: React.FC<LogoutIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-6 w-6", className)}
        {...props}
    >
        <path d="M46 112.813H139.878V577.187H46V112.813Z" />
        <path d="M139.878 19H300.408V112.813H139.878V19Z" />
        <path d="M201.837 297.624H362.367V391.437H201.837V297.624Z" />
        <path d="M139.878 577.187H300.408V671H139.878V577.187Z" />
        <path d="M362.367 170.977H456.245V297.624H362.367V170.977Z" />
        <path d="M362.367 391.437H456.245V518.085H362.367V391.437Z" />
        <path d="M456.245 234.77H550.122V455.23H456.245V234.77Z" />
        <path d="M362.367 297.624H456.245V391.437H362.367V297.624Z" />
        <path d="M456.245 297.624H550.122V391.437H456.245V297.624Z" />
        <path d="M550.122 297.624H644V391.437H550.122V297.624Z" />
    </svg>
);

LogoutIcon.displayName = "LogoutIcon";
