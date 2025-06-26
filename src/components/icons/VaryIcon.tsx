
import type React from 'react';
import { cn } from "@/lib/utils";

interface VaryIconProps extends React.SVGProps<SVGSVGElement> {}

export const VaryIcon: React.FC<VaryIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <path d="M12 470H243V570H12V470Z"/>
        <path d="M12 120H243V220H12V120Z"/>
        <path d="M193 420H293V520H193V420Z"/>
        <path d="M243 320H343V420H243V320Z"/>
        <path d="M293 220H393V320H293V220Z"/>
        <path d="M193 170H293V270H193V170Z"/>
        <path d="M345 470H579V570H345V470Z"/>
        <path d="M577 120H677V220H577V120Z"/>
        <path d="M579 470H679V570H579V470Z"/>
        <path d="M527 70H627V170H527V70Z"/>
        <path d="M477 20H577V120H477V20Z"/>
        <path d="M527 170H627V270H527V170Z"/>
        <path d="M477 220H577V320H477V220Z"/>
        <path d="M529 420H629V520H529V420Z"/>
        <path d="M479 370H579V470H479V370Z"/>
        <path d="M529 520H629V620H529V520Z"/>
        <path d="M479 570H579V670H479V570Z"/>
        <path d="M343 120H577V220H343V120Z"/>
    </svg>
);

VaryIcon.displayName = "VaryIcon";
