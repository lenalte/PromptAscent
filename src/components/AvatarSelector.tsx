"use client";

import React from "react";
import { AVATARS, type AvatarId } from "@/data/avatars";
import { AvatarDisplay } from "@/components/AvatarDisplay";

type Props = {
  value: AvatarId | null;
  onChange: (avatarId: AvatarId) => void;
};

export const AvatarSelector: React.FC<Props> = ({ value, onChange }) => (
  <div className="grid grid-cols-4 gap-4 justify-items-center pt-2 pb-4">
    {AVATARS.map((avatar) => (
      <button
        key={avatar.id}
        type="button"
        onClick={() => onChange(avatar.id)}
        className={`p-2 rounded-full transition-all duration-200 bg-transparent
          ${value === avatar.id
            ? "ring-1 ring-primary ring-offset-1"
            : "hover:bg-muted"
          }
          focus:bg-transparent active:bg-transparent
        `}
      >
        <AvatarDisplay avatarId={avatar.id} className={`h-16 w-16 ${value === avatar.id ? "fill-white" : ""}`} />
        <span className="sr-only">{avatar.name}</span>
      </button>
    ))}
  </div>
);
