
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EightbitButton } from '@/components/ui/eightbit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, useFormContext } from '@/components/ui/form';
import { useUserProgress } from '@/context/UserProgressContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AVATARS, type AvatarId } from '@/data/avatars';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { cn } from '@/lib/utils';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const registrationSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must be 20 characters or less." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  avatarId: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // path of error
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUpWithEmail } = useUserProgress();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatarId: 'avatar1'
    },
  });

  const selectedAvatarId = form.watch('avatarId');

  const onFinalSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    setError(null);

    // Firebase Authentication
    const auth = getAuth();
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Inform the user that a verification link has been sent
      toast({
        title: "Registration Successful",
        description: "A verification email has been sent. Please check your inbox!",
      });

      // Redirect the user
      router.push('/');

    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      
      if (errorCode === "auth/email-already-in-use") {
        form.setError("email", { type: "manual", message: "This email is already registered." });
        setStep(1); // Go back to step 1 to show the error
      } else {
        setError(errorMessage);
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

   // Funktion zur Überprüfung der E-Mail-Verifizierung
   const checkEmailVerification = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      console.log('Checking email verification status...');
      // Überprüfen, ob die E-Mail bestätigt wurde
      const emailVerified = user.emailVerified;
      console.log('Email Verified:', emailVerified);
      return emailVerified;
    } else {
      console.log('No user found.');
      return false;
    }
  };

  
  const handleNextStep = async () => {
    const fieldsToValidate: ('username' | 'email' | 'password' | 'confirmPassword')[] = ['username', 'email', 'password', 'confirmPassword'];
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setStep(2);
    }
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          {step === 1 ? 'Step 1: Enter your account details.' : 'Step 2: Choose your avatar.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-4">
            {step === 1 && (
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="password">Password</Label>
                      <FormControl>
                        <Input id="password" type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <FormControl>
                        <Input id="confirmPassword" type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <EightbitButton type="button" className="w-full" onClick={handleNextStep}>
                    Next
                 </EightbitButton>
              </>
            )}

            {step === 2 && (
              <>
                 <FormField
                  control={form.control}
                  name="avatarId"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Choose Your Avatar</Label>
                      <FormControl>
                        <div className="grid grid-cols-4 gap-4 justify-items-center pt-2">
                          {AVATARS.map(avatar => (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => field.onChange(avatar.id)}
                              className={cn(
                                'p-2 rounded-full transition-all duration-200',
                                selectedAvatarId === avatar.id
                                  ? 'ring-2 ring-primary ring-offset-2 bg-primary/20'
                                  : 'hover:bg-muted'
                              )}
                              disabled={isLoading}
                            >
                              <AvatarDisplay avatarId={avatar.id} className="h-16 w-16" />
                              <span className="sr-only">{avatar.name}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <EightbitButton type="button" onClick={() => setStep(1)} disabled={isLoading} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </EightbitButton>
                    <EightbitButton type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      Create Account
                    </EightbitButton>
                </div>
              </>
            )}
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
