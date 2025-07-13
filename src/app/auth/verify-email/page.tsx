"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const router = useRouter();

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Please check your inbox and click on the verification link sent to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-sm mb-4">We have sent a verification email to your address. Please verify your email before proceeding.</p>
          <Button onClick={() => router.push('/auth/login')} variant="outline">
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
