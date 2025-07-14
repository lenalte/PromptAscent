
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EightbitButton } from '@/components/ui/eightbit-button';

export default function LoginPage() {
  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" passHref legacyBehavior>
          <EightbitButton as="a">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </EightbitButton>
        </Link>
      </div>
      <LoginForm />
    </>
  );
}
