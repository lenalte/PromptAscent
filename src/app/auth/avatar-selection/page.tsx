"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AVATARS, type AvatarId } from '@/data/avatars';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AvatarSelection() {
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarId | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();

  const handleAvatarSelection = (avatarId: AvatarId) => {
    setSelectedAvatarId(avatarId);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatarId) {
      toast({
        title: "No Avatar Selected",
        description: "Please select an avatar before proceeding.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the user's profile with the selected avatar
      await updateProfile(auth.currentUser!, {
        photoURL: selectedAvatarId, // Save the avatarId as the photoURL (or store it elsewhere)
      });

      const db = getFirestore();
      const userRef = doc(db, "users", auth.currentUser?.uid);

      await updateDoc(userRef, {
        avatarId: selectedAvatarId,  // Save the avatar ID in Firestore
      });

      toast({
        title: "Avatar Saved",
        description: "Your avatar has been successfully saved!",
      });

      router.push('/'); // Redirect to the homepage or other relevant page
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl">Choose Your Avatar</h1>
      <div className="grid grid-cols-4 gap-4 justify-items-center pt-2">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => handleAvatarSelection(avatar.id)}
            className={`p-2 rounded-full transition-all duration-200 ${selectedAvatarId === avatar.id ? 'ring-2 ring-primary ring-offset-2 bg-primary/20' : 'hover:bg-muted'}`}
          >
            <AvatarDisplay avatarId={avatar.id} className="h-16 w-16" />
            <span className="sr-only">{avatar.name}</span>
          </button>
        ))}
      </div>
      <EightbitButton onClick={handleSaveAvatar} className="w-full">
        Save Avatar
      </EightbitButton>
    </div>
  );
}
