import { EightbitButton } from '@/components/ui/eightbit-button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-primary">Datenschutzerklärung</h1>
      <div className="space-y-4 text-foreground/80">
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">1. Verantwortliche Stelle</h2>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Plattform ist Prompt Ascent.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">2. Datenerfassung</h2>
        <p>Wir erfassen und speichern Daten, die für die Bereitstellung des Dienstes notwendig sind, einschließlich Nutzername, E-Mail-Adresse und Lernfortschritt.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">3. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.</p>
      </div>
    </div>
  );
}
