// components/EightbitButton.tsx
import { ArrowRight } from "lucide-react";
import React from "react";

interface EightbitButtonProps {
    children: React.ReactNode;
    as?: 'button' | 'a';
    href?: string;
    onClick?: () => void;
    className?: string;
}

export function EightbitButton({
    children,
    as = 'button',
    href,
    onClick,
    className = ''
}: EightbitButtonProps) {
    const baseClasses = `
    relative 
    inline-block
    bg-[hsl(var(--foreground))]
    text-[hsl(var(--background))]
    px-5
    py-3
    hover:bg-[hsl(var(--foreground))_/_0.8]
    hover:text-[hsl(var(--background))_/_0.8]
    hover:shadow-[inset_-6px_-6px_0_0_hsl(var(--secondary))]
    active:shadow-[inset_4px_4px_0_0_hsl(var(--secondary))]
    transition-all
    duration-100
    z-10
    no-underline
    ${className}
  `;

    const Element = as;

    const elementProps = {
        className: baseClasses,
        ...(as === 'a' ? { href } : { onClick }),
    };

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