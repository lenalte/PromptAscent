
import RegistrationForm from '@/components/auth/RegistrationForm';
import BirdsBackground from '@/components/BirdsBackground';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BirdsBackground />
       <div className="absolute top-4 left-4 z-10">
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <div className="w-full max-w-md z-10">
        <RegistrationForm />
      </div>
    </div>
  );
}
