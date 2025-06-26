
import type React from 'react';
import { cn } from "@/lib/utils";

interface ApplyIconProps extends React.SVGProps<SVGSVGElement> {}

export const ApplyIcon: React.FC<ApplyIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <path d="M42.3917 8H615.84V49.3624H42.3917V8Z" />
        <path d="M615.84 82.9693H690V124.332H615.84V82.9693Z" />
        <path d="M298.503 391.464H411.468V432.826H298.503V391.464Z" />
        <path d="M298.503 639.638H411.468V681H298.503V639.638Z" />
        <path d="M615.84 237.216H690V278.579H615.84V237.216Z" />
        <path d="M333.859 278.579H652.92V319.941H333.859V278.579Z" />
        <path d="M615.84 49.3624V157.939H574.448V49.3624L615.84 49.3624Z" />
        <path d="M411.468 432.826V639.638H370.076V432.826H411.468Z" />
        <path d="M339.895 432.826V639.638H298.503V432.826H339.895Z" />
        <path d="M690 124.332V237.216H648.608V124.332H690Z" />
        <path d="M375.25 319.941V391.464H333.859V319.941H375.25Z" />
        <path d="M42.3917 157.939H615.84V199.301H42.3917V157.939Z" />
        <path d="M82.9212 49.3624L82.9211 157.939H1L1 49.3624L82.9212 49.3624Z" />
    </svg>
);

ApplyIcon.displayName = "ApplyIcon";
