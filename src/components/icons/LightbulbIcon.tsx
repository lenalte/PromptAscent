
import type React from 'react';
import { cn } from "@/lib/utils";

interface LightbulbIconProps extends React.SVGProps<SVGSVGElement> {}

export const LightbulbIcon: React.FC<LightbulbIconProps> = ({ className, ...props }) => (
    <svg
        width="690"
        height="690"
        viewBox="0 0 690 690"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-4 w-4", className)}
        {...props}
    >
        <path d="M156.571 87.5959H232.143V163.192H156.571V87.5959Z" />
        <path d="M81 163.192H156.571V238.788H81V163.192Z" />
        <path d="M81 238.788H156.571V314.384H81V238.788Z" />
        <path d="M81 314.384H156.571V389.98H81V314.384Z" />
        <path d="M534.429 163.192H610V238.788H534.429V163.192Z" />
        <path d="M534.429 238.788H610V314.384H534.429V238.788Z" />
        <path d="M534.429 314.384H610V389.98H534.429V314.384Z" />
        <path d="M232.143 12H307.714V87.5959H232.143V12Z" />
        <path d="M307.714 12H383.286V87.5959H307.714V12Z" />
        <path d="M383.286 12H458.857V87.5959H383.286V12Z" />
        <path d="M232.143 465.575H307.714V541.171H232.143V465.575Z" />
        <path d="M307.714 465.575H383.286V541.171H307.714V465.575Z" />
        <path d="M383.286 465.575H458.857V541.171H383.286V465.575Z" />
        <path d="M269.929 602.404H345.5V678H269.929V602.404Z" />
        <path d="M345.5 602.404H421.071V678H345.5V602.404Z" />
        <path d="M458.857 87.5959H534.429V163.192H458.857V87.5959Z" />
        <path d="M156.571 389.98H232.143V465.575H156.571V389.98Z" />
        <path d="M458.857 389.98H534.429V465.575H458.857V389.98Z" />
    </svg>
);

LightbulbIcon.displayName = "LightbulbIcon";
