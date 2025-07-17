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
      <div className="w-full z-10 pt-8">
        {children}
      </div>
    </div>
  );
}
