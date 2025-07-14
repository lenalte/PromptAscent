
import type { Metadata } from 'next';
import BirdsBackground from '@/components/BirdsBackground';

export const metadata: Metadata = {
  title: 'Prompt Ascent - Authentifizierung',
  description: 'Login oder Registrierung für Prompt Ascent.',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BirdsBackground />
      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
