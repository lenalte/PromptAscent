
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EightbitButton } from "@/components/ui/eightbit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {AvatarSelector} from "@/components/AvatarSelector";
import type { AvatarId } from "@/data/avatars";

const emailSchema = z.object({
  email: z.string().email({ message: "Ungültige E-Mail-Adresse." }),
});
const profileSchema = z.object({
  username: z.string().min(3, { message: "Mind. 3 Zeichen." }).max(20, { message: "Max. 20 Zeichen." }),
  avatar: z.string().min(1, { message: "Bitte wähle einen Avatar." }),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;

type Step = "email" | "waitingLink" | "profile" | "done";

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [authProcessing, setAuthProcessing] = useState(false);
  const [profileStep, setProfileStep] = useState<"username" | "avatar">("username");
  const { toast } = useToast();
  const router = useRouter();


  // 1. Email-Eingabe-Form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  // 2. Profil-Eingabe-Form (nur bei Registrierung)
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", avatar: "" },
  });

  // Passwordless Login/Signup - EIN Feld für alles!
  const onSubmitEmail = async (data: EmailFormValues) => {
    setIsLoading(true);
    const auth = getAuth();
    const email = data.email.trim();
    const tempPassword = "SomePassword1234!";
    setPendingEmail(email);

    try {
      // Versuch: User anlegen (Registration)
      await createUserWithEmailAndPassword(auth, email, tempPassword);
      // NEUER User – jetzt Profil-Completion anzeigen!
      setStep("profile");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        // ACCOUNT EXISTIERT: Direkt Login-Link schicken!
        const actionCodeSettings = {
          url: window.location.origin + "/auth/register", // der Pfad dieser Seite!
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", email);
        setStep("waitingLink");
        toast({
          title: "Login-Link verschickt",
          description: "Checke deine E-Mails zum Einloggen! Habe auch deinen Spam-Ordner im Auge!",
        });
      } else {
        toast({
          title: "Fehler",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  };

  // Nach Registrierung: Profil speichern + Login-Link senden!
  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsLoading(true);
    const auth = getAuth();
    const db = getFirestore();

    if (!pendingEmail) {
      toast({ title: "Fehler", description: "E-Mail fehlt. Bitte neu starten.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Finde User (wurde vorhin erstellt)
    const user = auth.currentUser;
    if (!user) {
        toast({ title: "Fehler", description: "Benutzer nicht gefunden. Bitte neu registrieren.", variant: "destructive" });
        setIsLoading(false);
        setStep("email"); // Zurück zum Anfang
        return;
    }

    // Firestore-Profil speichern
    await setDoc(doc(db, "users", user.uid), {
      username: data.username,
      avatarId: data.avatar, // Use the correct key 'avatarId'
      email: pendingEmail,
      // Add other initial fields here
      totalPoints: 0,
      completedLessons: [],
      unlockedLessons: ["lesson1"],
      currentLessonId: "lesson1",
      lessonStageProgress: {},
    });

    // Login-Link schicken
    const actionCodeSettings = {
      url: window.location.origin + "/auth/register",
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, pendingEmail, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", pendingEmail);
    setStep("waitingLink");
    toast({
      title: "Registrierung fast fertig",
      description: "Checke deine Mails und bestätige den Link, um einzuloggen!",
    });
    setIsLoading(false);
  };

  // Passwordless Link Handler
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
      const url = window.location.href;
      if (isSignInWithEmailLink(auth, url)) {
        setAuthProcessing(true);
        let storedEmail = window.localStorage.getItem("emailForSignIn");
        if (!storedEmail) {
          storedEmail = window.prompt("Bitte gib deine E-Mail zur Bestätigung ein");
        }
        if (storedEmail) {
          try {
            const cred = await signInWithEmailLink(auth, storedEmail, url);
            window.localStorage.removeItem("emailForSignIn");
            // Profile prüfen – fehlt was?
            const db = getFirestore();
            const userRef = doc(db, "users", cred.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists() || !userSnap.data().username || !userSnap.data().avatarId) { // Check for avatarId
              setStep("profile");
              setPendingEmail(cred.user.email || "");
              toast({
                title: "Profil unvollständig",
                description: "Bitte wähle Username & Avatar.",
              });
            } else {
              setStep("done");
              toast({ title: "Login erfolgreich", description: "Du bist eingeloggt." });
              router.push("/"); // oder wohin du willst
            }
          } catch (err: any) {
            toast({
              title: "Fehler",
              description: err.message,
              variant: "destructive",
            });
            setAuthProcessing(false);
          }
        }
        setAuthProcessing(false);
      }
    })();
    return () => { isMounted = false; };
  }, [router, toast]);

  const handleUsernameNext = async () => {
    const isValid = await profileForm.trigger("username");
    if (isValid) {
      setProfileStep("avatar");
    }
    // Bei Fehlern bleibt die Card offen und zeigt die Validierungs-Message an
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {step === "email" && "Login oder Registrierung"}
          {step === "waitingLink" && "Checke deine E-Mails"}
          {step === "profile" && "Profil vervollständigen"}
          {step === "done" && "Willkommen!"}
        </CardTitle>
        <CardDescription>
          {step === "email" && "Gib deine E-Mail ein. Wir prüfen für dich, ob ein Account existiert oder du neu bist."}
          {step === "waitingLink" && "Du erhältst gleich einen Login-Link per Mail."}
          {step === "profile" && "Wähle Username und Avatar, um deinen Account zu vervollständigen."}
          {step === "done" && "Du bist eingeloggt."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">E-Mail</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="m@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="rounded-md bg-muted p-3 text-xs text-foreground border mb-2">
        <b>Hinweis zur Datennutzung</b><br />
        Diese Plattform wird im Rahmen einer Bachelorarbeit betrieben. Während du die Anwendung nutzt, werden anonymisierte Daten zur Verbesserung der Plattform erhoben (mithilfe von Google Analytics). Deine Eingaben in den Aufgaben werden zudem zur automatisierten Auswertung an die Gemini API übermittelt.<br /><br />
        Mit der Registrierung erklärst du dich damit einverstanden. Weitere Infos findest du in der <a href="/legal/datenschutz" className="underline" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.
      </div>
              <EightbitButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Fortfahren"}
              </EightbitButton>
            </form>
          </Form>
        )}

        {step === "profile" && profileStep === "username" && (
          <Form {...profileForm}>
            <form onSubmit={e => { e.preventDefault(); handleUsernameNext(); }} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="username">Username</Label>
                    <FormControl>
                      <Input id="username" placeholder="dein_username" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <EightbitButton type="submit" className="w-full" disabled={isLoading}>
        Weiter
      </EightbitButton>
    </form>
  </Form>
)}
{step === "profile" && profileStep === "avatar" && (
  <Form {...profileForm}>
    <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
      <FormField
        control={profileForm.control}
        name="avatar"
        render={({ field }) => (
          <FormItem>
            <Label>Avatar</Label>
            <AvatarSelector
              value={field.value as AvatarId}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <EightbitButton type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Profil speichern & Login-Link senden"}
      </EightbitButton>
    </form>
  </Form>
)}

        {step === "waitingLink" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <div className="mt-4 text-sm text-muted-foreground">
              Wir haben dir eine E-Mail geschickt.<br />
              Klicke auf den Link darin, um dich einzuloggen.
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-8">
            <div className="text-lg font-bold mb-2">Erfolgreich eingeloggt 🎉</div>
            <EightbitButton className="w-full" onClick={() => router.push("/")}>
              Zum Dashboard
            </EightbitButton>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {step === "email" && (
          <div className="text-center text-sm">
            {/* Platz für weitere Links (z.B. Datenschutz, Impressum) */}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
