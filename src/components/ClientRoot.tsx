"use client";

import Toaster from "@/components/Toaster";
import AuthRedirect from "@/components/auth/AuthRedirect";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalyticsSuspense from "@/components/GoogleAnalyticsSuspense";
import { UserProgressProvider } from "@/context/UserProgressContext";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    return (
        <>
            <GoogleAnalyticsSuspense />
            <UserProgressProvider>
                <AuthRedirect>
                    {children}
                </AuthRedirect>
                <Toaster />
            </UserProgressProvider>
            <CookieBanner />
        </>
    );
}
