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
import { LoginIcon } from "../icons/LoginIcon";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, browserLocalPersistence, setPersistence, fetchSignInMethodsForEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const loginSchema = z.object({
  email: z.string().email({ message: "Ungültige E-Mail-Adresse." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authProcessing, setAuthProcessing] = useState(false);
  const { toast } = useToast();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });
  const router = useRouter();

  // Profile-Check nach erfolgreichem Login
  async function checkProfileAndRedirect(user: any) {
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Falls Daten fehlen → Weiterleitung auf Profil-Setup
    if (!userSnap.exists() || !userSnap.data().username || !userSnap.data().avatar) {
      router.push("/auth/avatar-selection");
    } else {
      router.push("/");
    }
  }

  // Email-Link-Login
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
      const url = window.location.href;

      if (isSignInWithEmailLink(auth, url)) {
        if (!isMounted) return;
        setAuthProcessing(true);
        let storedEmail = window.localStorage.getItem("emailForSignIn");
        if (!storedEmail) {
          storedEmail = window.prompt("Bitte gib deine E-Mail zur Bestätigung ein");
        }
        if (storedEmail) {
          try {
            const cred = await signInWithEmailLink(auth, storedEmail, url);
            window.localStorage.removeItem("emailForSignIn");
            toast({ title: "Login erfolgreich!", description: "Du bist jetzt eingeloggt." });
            // Profile-Check!
            await checkProfileAndRedirect(cred.user);
          } catch (error: any) {
            toast({ title: "Fehler", description: `Fehler beim Login: ${error.message}`, variant: "destructive" });
            if (isMounted) setAuthProcessing(false);
          }
        } else {
          toast({ title: "Fehler", description: "E-Mail zur Bestätigung nicht gefunden. Bitte erneut versuchen.", variant: "destructive" });
          if (isMounted) setAuthProcessing(false);
        }
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && isMounted) {
          checkProfileAndRedirect(user);
        }
      });
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line
  }, [router, toast]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const email = data.email;
    const auth = getAuth();

    try {
      // Prüfen, ob Account existiert
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        toast({
          title: "Kein Account gefunden",
          description: "Für diese E-Mail existiert noch kein Account. Bitte registriere dich zuerst.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Überprüfen der E-Mail ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const actionCodeSettings = {
      url: window.location.origin + "/auth/login",
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      toast({
        title: "E-Mail verschickt",
        description: "Wenn diese E-Mail-Adresse registriert ist, erhältst du gleich einen Login-Link.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Versenden des Login-Links ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Gib deine E-Mail ein. Wir senden dir einen Login-Link – kein Passwort nötig!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authProcessing ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <div className="mt-4 text-sm text-muted-foreground">Du wirst eingeloggt...</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="m@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <EightbitButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LoginIcon className="mr-2 h-4 w-4" />}
                Login-Link senden
              </EightbitButton>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm">
          Noch keinen Account?{" "}
          <Link href="/auth/register" className="underline hover:text-primary">
            Registrieren
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
