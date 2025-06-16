
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import path if needed
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { UserProgressProvider } from '@/context/UserProgressContext'; // Import UserProgressProvider
import { JetBrains_Mono } from 'next/font/google';


// Assuming Geist and Geist_Mono setup is correct
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'The Promptening - Learn Prompt Engineering', // More descriptive title
  description: 'Interactive lessons and tools to master prompt engineering skills with AI feedback.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${jetBrainsMono.variable} antialiased bg-background text-foreground`}>
        <UserProgressProvider> {/* Wrap children with UserProgressProvider */}
          {children}
          <Toaster /> {/* Add Toaster here */}
        </UserProgressProvider>
      </body>
    </html>
  );
}

