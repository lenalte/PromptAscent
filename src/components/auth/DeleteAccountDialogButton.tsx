"use client";
import { useState } from "react";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DeleteAccountDialogButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

  const handleSendDeleteLink = async () => {
    setIsSending(true);
    try {
      const actionCodeSettings = {
        url: window.location.origin + "/auth/account-delete-confirm", // Passe den Pfad ggf. an!
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      toast({
        title: "Lösch-Link verschickt",
        description: "Checke deine E-Mails zum Löschen deines Accounts.",
      });
      setDialogOpen(false);
    } catch (e: any) {
      toast({
        title: "Fehler",
        description: e.message,
        variant: "destructive",
      });
    }
    setIsSending(false);
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="w-full flex items-center p-2 rounded-lg hover:bg-[var(--sidebar-accent)] text-destructive"
        >
          <Trash2 className="mr-3 ml-1 h-5 w-5" /> Account löschen
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Account unwiderruflich löschen</AlertDialogTitle>
          <AlertDialogDescription>
            Um deinen Account zu löschen, bestätige bitte deine E-Mail-Adresse. Du erhältst dann einen Lösch-Link per E-Mail.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded mt-2"
          placeholder="E-Mail-Adresse"
          disabled={isSending}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSendDeleteLink}
            disabled={isSending || !email}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Löschen-Link senden
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
