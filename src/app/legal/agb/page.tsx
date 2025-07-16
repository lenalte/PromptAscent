import { EightbitButton } from '@/components/ui/eightbit-button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AGBPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-primary">Allgemeine Geschäftsbedingungen</h1>
      <div className="space-y-4 text-foreground/80">
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">1. Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Lernplattform Prompt Ascent.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">2. Leistungen</h2>
        <p>Prompt Ascent stellt eine interaktive Lernumgebung zum Thema Prompt Engineering zur Verfügung.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">3. Haftungsausschluss</h2>
        <p>Die Inhalte dienen ausschließlich zu Lernzwecken. Für die Korrektheit der von der KI generierten Inhalte wird keine Haftung übernommen.</p>
      </div>
    </div>
  );
}
