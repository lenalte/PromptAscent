
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import path if needed
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { PointsProvider } from '@/context/PointsContext'; // Import PointsProvider

// Assuming Geist and Geist_Mono setup is correct
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <PointsProvider> {/* Wrap children with PointsProvider */}
          {children}
          <Toaster /> {/* Add Toaster here */}
        </PointsProvider>
      </body>
    </html>
  );
}

