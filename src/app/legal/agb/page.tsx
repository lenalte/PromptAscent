
import { EightbitButton } from '@/components/ui/eightbit-button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AGBPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-4 text-primary">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="text-muted-foreground mb-6"><strong>Stand:</strong> Juli 2025</p>

      <div className="space-y-6 text-base">
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform <strong>„Promptening“</strong>, erreichbar unter der jeweils mitgeteilten URL, die im Rahmen einer wissenschaftlichen Arbeit (Bachelorarbeit) bereitgestellt wird.
        </p>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">1. Zweck der Plattform</h2>
        <p>
          Die Plattform dient ausschließlich der <strong>Forschung und Evaluation</strong> im Rahmen einer Bachelorarbeit. Ziel ist es, die Lernwirksamkeit einer gamifizierten Anwendung zum Erlernen von Prompting (Formulieren von Texteingaben für KI-Systeme) zu untersuchen.
        </p>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">2. Teilnahme & Registrierung</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Die Nutzung ist <strong>freiwillig</strong> und <strong>kostenlos</strong>.</li>
          <li>Für die Nutzung ist eine <strong>Registrierung mit einer gültigen E-Mail-Adresse</strong> erforderlich.</li>
          <li>Teilnehmende versichern, dass sie mindestens 16 Jahre alt sind.</li>
        </ul>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">3. Inhalte & Nutzung</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Die Inhalte der Plattform (Aufgaben, Lernmodule, Belohnungssystem) dienen ausschließlich dem Testzweck.</li>
          <li>Es besteht <strong>kein Anspruch auf Verfügbarkeit, Vollständigkeit oder Fehlerfreiheit</strong>.</li>
          <li>Die Plattform darf nur für die vorgesehenen Lern- und Testzwecke genutzt werden.</li>
          <li>Missbrauch, automatisiertes Ausfüllen oder absichtliche Sabotage sind untersagt.</li>
        </ul>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">4. Datenschutz</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Die bei der Nutzung erhobenen personenbezogenen Daten (z.B. E-Mail-Adresse, Lernfortschritt, Eingaben) werden ausschließlich für den Zweck der wissenschaftlichen Evaluation verwendet.</li>
          <li>
            Details hierzu finden Sie in der{' '}
            <Link href="/legal/datenschutz" className="underline hover:text-accent transition-colors">
              <strong>Datenschutzerklärung</strong>
            </Link>
            .
          </li>
          <li>Die Daten werden nach Abschluss der Projektlaufzeit gelöscht.</li>
        </ul>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">5. Haftung</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Die Plattform wird mit größter Sorgfalt entwickelt, es wird jedoch <strong>keine Garantie für Verfügbarkeit, Funktionalität oder Ergebnisse</strong> übernommen.</li>
          <li>Es besteht <strong>keine Haftung</strong> für Schäden materieller oder immaterieller Art, die aus der Nutzung oder Nichtnutzung der Plattform entstehen.</li>
        </ul>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">6. Beendigung der Nutzung</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Die Teilnahme kann jederzeit durch eine formlose Mitteilung per E-Mail beendet werden.</li>
          <li>Auf Wunsch werden alle gespeicherten personenbezogenen Daten gelöscht.</li>
        </ul>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">7. Schlussbestimmungen</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Diese Plattform wird ausschließlich zu <strong>nicht-kommerziellen, wissenschaftlichen Zwecken</strong> betrieben.</li>
          <li>Es gilt das Recht der Bundesrepublik Deutschland.</li>
          <li>Gerichtsstand ist – soweit zulässig – der Wohnsitz des Betreibers.</li>
        </ul>
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Kontakt für Rückfragen oder zur Beendigung der Teilnahme:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          datenschutz@deinprojekt.de
        </blockquote>
      </div>
    </div>
  );
}
