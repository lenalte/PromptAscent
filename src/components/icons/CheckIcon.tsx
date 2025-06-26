
import type React from 'react';
import { cn } from "@/lib/utils";

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

export const CheckIcon: React.FC<CheckIconProps> = ({ className, ...props }) => (
    <svg
        width="886"
        height="886"
        viewBox="0 0 886 886"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-12 w-12", className)}
        {...props}
    >
        <path d="M648 154H716V222H648V154Z" />
        <path d="M68 68H136V136H68V68Z" />
        <path d="M750 68H818V136H750V68Z" />
        <path d="M750 750H818V818H750V750Z" />
        <path d="M68 750H136V818H68V750Z" />
        <path d="M818 68H886V818H818V68Z" />
        <path d="M0 68H68V818H0V68Z" />
        <path d="M818 3.27835e-05V68H68V0L818 3.27835e-05Z" />
        <path d="M818 818V886L68 886V818H818Z" />
        <path d="M580 222H648V290H580V222Z" />
        <path d="M648 222H716V290H648V222Z" />
        <path d="M716 222H784V290H716V222Z" />
        <path d="M512 290H580V358H512V290Z" />
        <path d="M580 290H648V358H580V290Z" />
        <path d="M648 290H716V358H648V290Z" />
        <path d="M444 358H512V426H444V358Z" />
        <path d="M512 358H580V426H512V358Z" />
        <path d="M580 358H648V426H580V358Z" />
        <path d="M376 426H444V494H376V426Z" />
        <path d="M444 426H512V494H444V426Z" />
        <path d="M512 426H580V494H512V426Z" />
        <path d="M321 494H389V562H321V494Z" />
        <path d="M253 494H321V562H253V494Z" />
        <path d="M185 494H253V562H185V494Z" />
        <path d="M117 426H185V494H117V426Z" />
        <path d="M185 426H253V494H185V426Z" />
        <path d="M246 426H314V494H246V426Z" />
        <path d="M178 358H246V426H178V358Z" />
        <path d="M389 494H457V562H389V494Z" />
        <path d="M457 494H525V562H457V494Z" />
        <path d="M253 562H321V630H253V562Z" />
        <path d="M321 562H389V630H321V562Z" />
        <path d="M389 562H457V630H389V562Z" />
        <path d="M287 608H355V676H287V608Z" />
        <path d="M355 608H423V676H355V608Z" />
        <path d="M321 642H389V710H321V642Z" />
    </svg>
);

CheckIcon.displayName = "CheckIcon";
