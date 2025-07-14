import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProgressProvider } from '@/context/UserProgressContext';
import { JetBrains_Mono } from 'next/font/google';
import AuthRedirect from '@/components/auth/AuthRedirect'; // Import the new component

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prompt Ascent - Meistere das KI-Prompting',
  description: 'Interaktive Lektionen und KI-gestützte Werkzeuge, um das Prompt Engineering zu meistern, mit stufenbasiertem Fortschritt und Feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${jetBrainsMono.variable} antialiased bg-background text-foreground`}>
        <UserProgressProvider>
          <AuthRedirect>
            {children}
          </AuthRedirect>
          <Toaster />
        </UserProgressProvider>
      </body>
    </html>
  );
}
