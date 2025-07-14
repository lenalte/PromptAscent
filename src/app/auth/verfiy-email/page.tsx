"use client";

// pages/auth/verify-email.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, applyActionCode } from 'firebase/auth';

export default function VerifyEmail() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode'); // `oobCode` wird aus der URL extrahiert

    if (oobCode) {
      // Verarbeite den Verifizierungslink
      applyActionCode(auth, oobCode)
        .then(() => {
          console.log('Email successfully verified');
          // Weiterleitung zur Hauptseite
          router.push('/');
        })
        .catch((error) => {
          console.error('Error verifying email:', error);
          // Fehlerbehandlung für ungültigen oder abgelaufenen Code
          alert('The verification link is invalid or has expired.');
        });
    } else {
        // If there's no code, maybe redirect to login or show a message
        router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Please wait while we verify your email...</p>
    </div>
  );
}
