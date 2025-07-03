
import LoginForm from '@/components/auth/LoginForm';
import BirdsBackground from '@/components/BirdsBackground';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EightbitButton } from '@/components/ui/eightbit-button';

export default function LoginPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BirdsBackground />
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" passHref legacyBehavior>
          <EightbitButton as="a">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </EightbitButton>
        </Link>
      </div>
      <div className="w-full max-w-md z-10">
        <LoginForm />
      </div>
    </div>
  );
}
