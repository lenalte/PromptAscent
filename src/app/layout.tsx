import type { Metadata } from 'next';
import './globals.css';
import { JetBrains_Mono } from 'next/font/google';
import ClientRoot from "@/components/ClientRoot";

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prompt Ascent - Meistere das KI-Prompting',
  description: 'Interaktive Lektionen und KI-gestützte Werkzeuge, um das Prompt Engineering zu meistern, mit stufenbasiertem Fortschritt und Feedback.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${jetBrainsMono.variable} antialiased bg-background text-foreground`}>
        <ClientRoot>
          {children}
        </ClientRoot>
      </body>
    </html>
  );
}
