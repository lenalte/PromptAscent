
import type React from 'react';
import { ProfilIcon } from '@/components/icons/ProfilIcon';
import { Avatar2Icon } from '@/components/icons/Avatar2Icon';
import { Avatar3Icon } from '@/components/icons/Avatar3Icon';
import { Avatar4Icon } from '@/components/icons/Avatar4Icon';

export type AvatarId = 'avatar1' | 'avatar2' | 'avatar3' | 'avatar4';

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
];

export function getAvatar(id?: AvatarId): Avatar {
  return AVATARS.find(avatar => avatar.id === id) || AVATARS[0]; // Default to first avatar
}
