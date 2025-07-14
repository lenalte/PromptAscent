"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useUserProgress } from '@/context/UserProgressContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 

// Validation Schema
const registrationSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must be 20 characters or less." }),
  email: z.string().email({ message: "Invalid email address." }),
}).refine(data => data.username !== "", {
  message: "Username is required.",
  path: ["username"], // path of error
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  const selectedAvatarId = form.watch('avatarId');

  // Handle next step, this validates the form and sends verification email
  const handleNextStep = async (data: RegistrationFormValues) => {
    const fieldsToValidate: ('username' | 'email')[] = ['username', 'email'];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      const email = form.getValues('email');
      const auth = getAuth();

      const actionCodeSettings = {
        url: 'https://6000-idx-studio-1746014326268.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev/auth/avatar-selection',
        handleCodeInApp: true,
      };

      try {
        // Create user with email and temporary password
        const tempPassword = 'temporaryPassword1234'; // Temporarily use a password
        await createUserWithEmailAndPassword(auth, email, tempPassword);

        // Log the data to check if username is correctly passed
        console.log("Form Data:", data);
        console.log("Username:", data.username);

        // Save additional user data (username) in Firestore
        const db = getFirestore();
        const userRef = doc(db, "users", auth.currentUser?.uid);
        console.log("Saving to Firestore:", userRef);

        await setDoc(userRef, {
          username: data.username,  // Save the username
          email: email,  // Save the email address
        });

        // Send verification link to email
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);

        toast({
          title: "Registration Successful",
          description: "A verification email has been sent. Please check your inbox and confirm your email address.",
        });

        // Check if the user clicks the link and signs in
        const url = window.location.href;
        if (isSignInWithEmailLink(auth, url)) {
          let storedEmail = window.localStorage.getItem('emailForSignIn');
          if (!storedEmail) {
            storedEmail = window.prompt('Please provide your email for confirmation');
          }

          // Sign the user in with the link
          await signInWithEmailLink(auth, storedEmail!, url);

          // Remove email from local storage
          window.localStorage.removeItem('emailForSignIn');

          // Go to step 2 (Avatar selection)
          // setStep(2);
        } else {
          // If the email is not verified
          toast({
            title: "Email Not Verified",
            description: "Please verify your email before proceeding.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error sending verification email:', error);
        toast({
          title: "Error",
          description: `An error occurred: ${error.message}`, // More detailed error message
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          {'Step 1: Enter your account details.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-4">
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="username">Username</Label>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input id="username" placeholder="your_username" {...field} disabled={isLoading} className="pl-8" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Create Account
                </EightbitButton>
              </>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline hover:text-primary">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}