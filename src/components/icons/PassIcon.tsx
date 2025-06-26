
import type React from 'react';
import { cn } from "@/lib/utils";

interface PassIconProps extends React.SVGProps<SVGSVGElement> {}

export const PassIcon: React.FC<PassIconProps> = ({ className, ...props }) => (
    <svg
        width="740"
        height="690"
        viewBox="0 0 740 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <path d="M328.889 50H411.111V132.148H328.889V50Z" />
        <path d="M246.667 91.0739H328.889V173.222H246.667V91.0739Z" />
        <path d="M411.111 91.0739H493.333V173.222H411.111V91.0739Z" />
        <path d="M164.444 132.148H246.667V214.296H164.444V132.148Z" />
        <path d="M82.2222 173.222H164.444V255.37H82.2222V173.222Z" />
        <path d="M493.333 132.148H575.556V214.296H493.333V132.148Z" />
        <path d="M575.556 173.222H657.778V255.37H575.556V173.222Z" />
        <path d="M657.778 214.296H740V296.444H657.778V214.296Z" />
        <path d="M0 214.296H82.2222V296.444H0V214.296Z" />
        <path d="M82.2222 255.37H164.444V337.517H82.2222V255.37Z" />
        <path d="M164.444 296.444H246.667V378.591H164.444V296.444Z" />
        <path d="M246.667 337.517H328.889V419.665H246.667V337.517Z" />
        <path d="M328.889 378.591H411.111V460.739H328.889V378.591Z" />
        <path d="M164.444 515.778H246.667V597.926H164.444V515.778Z" />
        <path d="M493.333 515.778H575.556V597.926H493.333V515.778Z" />
        <path d="M411.111 556.852H493.333V639H411.111V556.852Z" />
        <path d="M246.667 556.852H411.111V639H246.667V556.852Z" />
        <path d="M411.111 337.517H493.333V419.665H411.111V337.517Z" />
        <path d="M493.333 296.444H575.556V378.591H493.333V296.444Z" />
        <path d="M575.556 255.37H657.778V337.517H575.556V255.37Z" />
        <path d="M657.778 296.444H740V500.17H657.778V296.444Z" />
        <path d="M123.333 337.517H205.556V515.778H123.333V337.517Z" />
        <path d="M534.444 337.517H616.667V515.778H534.444V337.517Z" />
    </svg>
);

PassIcon.displayName = "PassIcon";
