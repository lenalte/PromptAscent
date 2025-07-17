import React from "react";
import { AVATARS, type AvatarId } from "@/data/avatars";
import { AvatarDisplay } from "@/components/AvatarDisplay";

type Props = {
  value: AvatarId | null;
  onChange: (avatarId: AvatarId) => void;
};

export const AvatarSelector: React.FC<Props> = ({ value, onChange }) => (
  <div className="grid grid-cols-4 gap-4 justify-items-center pt-2">
    {AVATARS.map((avatar) => (
      <button
        key={avatar.id}
        type="button"
        onClick={() => onChange(avatar.id)}
        className={`p-2 rounded-full transition-all duration-200 ${
          value === avatar.id
            ? "ring-2 ring-primary ring-offset-2 bg-primary/20"
            : "hover:bg-muted"
        }`}
      >
        <AvatarDisplay avatarId={avatar.id} className="h-16 w-16" />
        <span className="sr-only">{avatar.name}</span>
      </button>
    ))}
  </div>
);
