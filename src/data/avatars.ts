import type React from 'react';
import { ProfilIcon } from '@/components/icons/ProfilIcon';
import { Avatar2Icon } from '@/components/icons/Avatar2Icon';
import { Avatar3Icon } from '@/components/icons/Avatar3Icon';
import { Avatar4Icon } from '@/components/icons/Avatar4Icon';
import { Avatar5Icon } from '@/components/icons/Avatar5Icon';
import { Avatar6Icon } from '@/components/icons/Avatar6Icon';
import { Avatar7Icon } from '@/components/icons/Avatar7Icon';
import { Avatar8Icon } from '@/components/icons/Avatar8Icon';

export type AvatarId = 'avatar1' | 'avatar2' | 'avatar3' | 'avatar4' | 'avatar5' | 'avatar6' | 'avatar7' | 'avatar8';

export interface Avatar {
  id: AvatarId;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const AVATARS: Avatar[] = [
  { id: 'avatar1', name: 'Standard', icon: ProfilIcon },
  { id: 'avatar2', name: 'Klassisch', icon: Avatar2Icon },
  { id: 'avatar3', name: 'Modern', icon: Avatar3Icon },
  { id: 'avatar4', name: 'Abstrakt', icon: Avatar4Icon },
  { id: 'avatar5', name: 'Futuristisch', icon: Avatar5Icon },
  { id: 'avatar6', name: 'Elegant', icon: Avatar6Icon },
  { id: 'avatar7', name: 'Futuristisch II', icon: Avatar7Icon },
  { id: 'avatar8', name: 'Elegant II', icon: Avatar8Icon },
];

export function getAvatar(id?: AvatarId | string): Avatar {
  return AVATARS.find(avatar => avatar.id === id) || AVATARS[0]; // Default to first avatar
}
