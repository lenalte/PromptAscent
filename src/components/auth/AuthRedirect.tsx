
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useUserProgress } from '@/context/UserProgressContext';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import BirdsBackground from '../BirdsBackground';
import { Suspense } from 'react';

function AuthRedirectInner({ children }: { children: React.ReactNode }) {
    const { isLoadingAuth, currentUser } = useUserProgress();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't redirect if we are on an auth or legal page, or if we are still loading
        if (isLoadingAuth || pathname.startsWith('/auth') || pathname.startsWith('/legal')) {
            return;
        }

        if (!currentUser) {
            router.push('/auth/register');
        } else if (currentUser.isAnonymous) {
            router.push('/auth/register');
        }
    }, [isLoadingAuth, currentUser, router, pathname]);

    // Show a loading screen for protected routes while auth state is being determined.
    // Auth and legal pages will render their content immediately.
    if (isLoadingAuth && !pathname.startsWith('/auth') && !pathname.startsWith('/legal')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <BirdsBackground />
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <AuthRedirectInner>{children}</AuthRedirectInner>
        </Suspense>
    );
}