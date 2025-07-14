import type { Metadata } from 'next';
// Removed Geist imports, if UntitledSans is the primary choice for body text, or if Arial/Helvetica is acceptable fallback
// import { Geist, Geist_Mono } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProgressProvider } from '@/context/UserProgressContext';
import { JetBrains_Mono } from 'next/font/google'; // Keeping JetBrains for mono if needed

// If UntitledSans is to be used as a variable font for body:
// You would typically use next/font to load it if it's a variable font file.
// Since it's loaded via @font-face in globals.css, we don't need a next/font instance for it here for body.
// The `font-family` in `globals.css` body tag will apply it.

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono', // If you use this for specific code blocks
  subsets: ['latin'],
  display: 'swap', // Good practice for font loading
});

export const metadata: Metadata = {
  title: 'Prompt Ascent - Meistere das KI-Prompting', // Updated Title
  description: 'Interaktive Lektionen und KI-gestützte Werkzeuge, um das Prompt Engineering zu meistern, mit stufenbasiertem Fortschritt und Feedback.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      {/* 
        If you want to apply UntitledSans globally via a CSS variable from next/font (requires font file setup):
        <body className={`${untitledSans.variable} ${jetBrainsMono.variable} antialiased bg-background text-foreground`}>
        Otherwise, rely on globals.css for body font-family. JetBrains Mono can still be a variable for specific elements.
      */}
      <body className={`${jetBrainsMono.variable} antialiased bg-background text-foreground`}>
        <UserProgressProvider>
          {children}
          <Toaster />
        </UserProgressProvider>
      </body>
    </html>
  );
}