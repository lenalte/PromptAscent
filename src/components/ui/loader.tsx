
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: number; // Size of the icon
}

export const Loader: React.FC<LoaderProps> = ({ className, size = 16 }) => {
  return (
    <Loader2
      className={cn("animate-spin text-primary", className)}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
```