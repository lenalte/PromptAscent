"use client";
import { useEffect } from "react";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
          try {
            await deleteUser(cred.user);
            toast({
              title: "Account gelöscht",
              description: "Dein Account wurde erfolgreich gelöscht.",
            });
            router.push("/"); // oder z.B. /goodbye
          } catch (error: any) {
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
