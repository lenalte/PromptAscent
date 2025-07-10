// Code aus Quelle: https://codepen.io/Maximuz/pen/BdqXXN 
import { ArrowRight } from "lucide-react";
import React from "react";

interface EightbitButtonProps {
    children: React.ReactNode;
    as?: 'button' | 'a';
    href?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => void; // Added event type
    className?: string;
    disabled?: boolean;
}

export function EightbitButton({
    children,
    as = 'button',
    href,
    onClick,
    className = '',
    disabled = false
}: EightbitButtonProps) {
    const baseClasses = `
    relative 
    inline-block
    bg-[hsl(var(--foreground))]
    text-white
    px-4
    py-2
    hover:bg-[hsl(var(--background))]
    hover:text-[hsl(var(--foreground))]
    
    transition-all
    duration-100
    z-10
    no-underline
    ${className}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

    const Element = as;

    const elementProps: any = {
        className: baseClasses,
        onClick,
    };

    if (as === 'button') {
        elementProps.disabled = disabled;
    } else {
        elementProps.href = href;
    }


    return (
        <Element {...elementProps}>
            {/* Top/Bottom Border (mimics ::before) */}
            <span
                className="
          pointer-events-none
          absolute
          left-0
          right-0
          -top-[6px]
          h-[calc(100%+12px)]
          border-t-[6px] border-b-[6px] border-[hsl(var(--foreground))]
          group-hover:border-[hsl(var(--background))]
          border-solid
          z-10
        "
                aria-hidden="true"
            ></span>
            {/* Left/Right Border (mimics ::after) */}
            <span
                className="
          pointer-events-none
          absolute
          top-0
          bottom-0
          -left-[6px]
          w-[calc(100%+12px)]
          border-l-[6px] border-r-[6px] border-[hsl(var(--foreground))]
          border-solid
          group-hover:border-[hsl(var(--background))]
          z-10
        "
                aria-hidden="true"
            ></span>
            <span className="relative z-20 flex items-center justify-center">
                {children}
            </span>
        </Element>
    );
}
