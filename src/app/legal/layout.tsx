import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EightbitButton } from '@/components/ui/eightbit-button';
import BirdsBackground from '@/components/BirdsBackground';

export const metadata: Metadata = {
  title: 'Rechtliches - Prompt Ascent',
  description: 'Rechtliche Informationen für Prompt Ascent.',
};

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col min-h-screen bg-background p-4">
      <BirdsBackground />
      <div className="absolute top-4 left-4 z-20">
        <Link href="/" passHref legacyBehavior>
          <EightbitButton as="a">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </EightbitButton>
        </Link>
      </div>
      <div className="w-full z-10 pt-20">
        {children}
      </div>
    </div>
  );
}
