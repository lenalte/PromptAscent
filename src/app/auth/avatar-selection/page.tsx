"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AVATARS, type AvatarId } from '@/data/avatars';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        title: "Kein Avatar ausgewählt",
        description: "Bitte wähle einen Avatar aus.",
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
        title: "Avatar gespeichert",
        description: "Dein Avatar wurde erfolgreich gespeichert!",
      });

      router.push('/'); // Redirect to the homepage or other relevant page
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: `Es ist ein Fehler aufgetreten: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
    <Card className="w-full max-w-lg">
  <CardHeader>
    <CardTitle className="text-2xl">Choose Your Avatar</CardTitle>
    <CardDescription>
      {'Schritt 2: Wähle Deinen Avatar aus den Optionen aus.'}
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    <div className="space-y-4">
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
    </div>
  </CardContent>
  
  <CardFooter className="flex flex-col space-y-2">
    <EightbitButton onClick={handleSaveAvatar} className="w-full">
      Avatar speichern
    </EightbitButton>
  </CardFooter>
</Card>
</div>

  );
}
