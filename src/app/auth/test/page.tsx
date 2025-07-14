import BirdsBackground from '@/components/BirdsBackground';
import { ChevronLeft } from 'lucide-react';
import { EightbitButton } from '@/components/ui/eightbit-button';

export default function Successful() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BirdsBackground />
      <div className="absolute top-4 left-4 z-10">
          <EightbitButton as="a">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Du hast es geschafft!
          </EightbitButton>
      </div>
    </div>
  );
}
