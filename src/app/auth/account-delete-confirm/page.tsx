
"use client";
import { useEffect } from "react";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteUserDocument } from "@/services/userProgressService"; // Import the server action

export default function AccountDeleteConfirmPage() {
  const router = useRouter();
  const {toast} = useToast();

  useEffect(() => {
    const auth = getAuth();
    const url = window.location.href;

    if (isSignInWithEmailLink(auth, url)) {
      let email = window.localStorage.getItem("emailForSignIn") || window.prompt("Bitte bestätige deine E-Mail zum Löschen deines Accounts");
      if (!email) return;

      signInWithEmailLink(auth, email, url)
        .then(async (cred) => {
          const userId = cred.user.uid;
          try {
            // Step 1: Delete Firestore document first.
            await deleteUserDocument(userId);
            console.log(`Successfully deleted Firestore data for user ${userId}.`);

            // Step 2: Delete the Auth user.
            await deleteUser(cred.user);
            console.log(`Successfully deleted Auth user ${userId}.`);

            toast({
              title: "Account gelöscht",
              description: "Dein Account und alle zugehörigen Daten wurden erfolgreich gelöscht.",
            });
            router.push("/"); // oder z.B. /goodbye
          } catch (error: any) {
            console.error(`Error deleting account for user ${userId}:`, error);
            toast({
              title: "Fehler beim Löschen",
              description: error.message,
              variant: "destructive",
            });
          }
        })
        .catch((error: any) => {
          toast({
            title: "Fehler bei der Bestätigung",
            description: error.message,
            variant: "destructive",
          });
        })
        .finally(() => {
          window.localStorage.removeItem("emailForSignIn");
        });
    }
  }, [router, toast]);

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Account löschen</h1>
      <p>Dein Account wird jetzt gelöscht, falls die Bestätigung erfolgreich war...</p>
    </div>
  );
}
