
import type React from 'react';
import { cn } from "@/lib/utils";
import { AVATARS, getAvatar, type AvatarId } from '@/data/avatars';

interface AvatarDisplayProps extends React.SVGProps<SVGSVGElement> {
  avatarId?: AvatarId | string | null;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarId, className, ...props }) => {
  const avatar = getAvatar(avatarId as AvatarId | undefined); // Cast to allow string from DB
  const AvatarIcon = avatar.icon;

  return (
    <AvatarIcon
      className={cn("h-8 w-8 shrink-0", className)}
      {...props}
    />
  );
};
