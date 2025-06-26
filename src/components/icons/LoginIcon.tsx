import type React from 'react';
import { cn } from "@/lib/utils";

interface LoginIconProps extends React.SVGProps<SVGSVGElement> {}

export const LoginIcon: React.FC<LoginIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-6 w-6", className)}
        {...props}
    >
        <path d="M554.698 104.266H652V585.734H554.698V104.266Z" />
        <path d="M388.313 7H554.698V104.266H388.313V7Z" />
        <path d="M39 295.881H205.386V393.147H39V295.881Z" />
        <path d="M388.313 585.734H554.698V683H388.313V585.734Z" />
        <path d="M205.386 164.571H302.687V295.881H205.386V164.571Z" />
        <path d="M205.386 393.147H302.687V524.456H205.386V393.147Z" />
        <path d="M302.687 230.712H399.989V459.288H302.687V230.712Z" />
        <path d="M205.386 295.881H302.687V393.147H205.386V295.881Z" />
        <path d="M302.687 295.881H399.989V393.147H302.687V295.881Z" />
        <path d="M399.989 295.881H497.29V393.147H399.989V295.881Z" />
    </svg>
);

LoginIcon.displayName = "LoginIcon";
