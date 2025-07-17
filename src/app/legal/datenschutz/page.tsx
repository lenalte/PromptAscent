
import { EightbitButton } from '@/components/ui/eightbit-button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-4 text-primary">Datenschutzerklärung</h1>
      <p className="text-muted-foreground mb-6"><strong>Stand:</strong> Juli 2025</p>

      <div className="space-y-6 text-base">
        <p>
          Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung personenbezogener Daten auf der Plattform <strong>„Promptening“</strong>. Die Nutzung erfolgt im Rahmen einer <strong>Bachelorarbeit</strong> an einer deutschen Hochschule und dient ausschließlich zu <strong>Evaluations- und Testzwecken</strong>. Die Plattform wird für ca. 1–2 Monate öffentlich zugänglich sein.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">1. Verantwortlicher</h2>
        <p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Lena Ertl<br />
          lertl@hm.edu
        </blockquote>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">2. Zweck der Verarbeitung</h2>
        <p>
          Die Plattform dient der Durchführung eines wissenschaftlichen Tests zur <strong>Gamifizierung beim Erlernen von Prompting für Sprachmodelle</strong>. Die erhobenen Daten werden ausschließlich zu Zwecken der <strong>Forschung und Evaluation</strong> verwendet und nach Abschluss des Projekts gelöscht.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">3. Welche Daten werden erhoben?</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>E-Mail-Adresse (für Login via Firebase Auth)</li>
          <li>Nutzungsverhalten (z.B. gelöste Aufgaben, Eingaben)</li>
          <li>Prompt-Eingaben (werden zur Auswertung an Google Gemini gesendet)</li>
          <li>Analyse-Daten via Google Analytics</li>
        </ul>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">4. Hosting und Dienste</h2>
        <h3 className="text-xl font-semibold mt-4 text-secondary">Firebase (Google LLC)</h3>
        <p>Diese Plattform nutzt folgende Firebase-Dienste:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Firebase Authentication</li>
          <li>Firestore (Cloud-Datenbank)</li>
          <li>Firebase Hosting</li>
          <li>Firebase Cloud Functions</li>
        </ul>
        <p className="mt-2">Anbieter: Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
        <p><strong>Datenübertragung in die USA:</strong> möglich</p>
        <p>Ein EU-Standardvertragsklausel-Schutz besteht.</p>
        <p>Weitere Infos: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">https://firebase.google.com/support/privacy</a></p>

        <h3 className="text-xl font-semibold mt-4 text-secondary">Google Gemini (AI-Modell)</h3>
        <p>Zur automatisierten Auswertung der Nutzereingaben wird die API von <strong>Google Gemini (Vertex AI)</strong> genutzt. Dabei können Prompt-Eingaben an Server von Google übermittelt werden.</p>
        <p>Weitere Infos: <a href="https://cloud.google.com/vertex-ai/docs/general/privacy-and-security" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">https://cloud.google.com/vertex-ai/docs/general/privacy-and-security</a></p>

        <h3 className="text-xl font-semibold mt-4 text-secondary">Google Analytics</h3>
        <p>Zur anonymisierten Analyse des Nutzerverhaltens nutzen wir Google Analytics. Die IP-Adresse wird gekürzt verarbeitet. Die Daten helfen uns, die Plattform im Rahmen der Bachelorarbeit zu evaluieren.</p>
        <p><strong>Widerspruchsmöglichkeit:</strong> Über Ihre Browsereinstellungen (Do-Not-Track oder Opt-out)</p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">5. Rechtsgrundlage der Verarbeitung</h2>
        <p>Die Verarbeitung erfolgt auf Basis von <strong>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</strong>.</p>
        <p>Sie nehmen freiwillig teil und können Ihre Einwilligung jederzeit widerrufen.</p>
        
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">6. Speicherdauer</h2>
        <p>Alle erhobenen Daten werden <strong>nach Abschluss der Bachelorarbeit (voraussichtlich in 2 Monaten)</strong> vollständig gelöscht. Es erfolgt keine Weitergabe an Dritte.</p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">7. Ihre Rechte</h2>
        <p>Sie haben gemäß DSGVO das Recht auf:</p>
        <ul className="list-disc list-inside space-y-1">
            <li>Auskunft über Ihre gespeicherten Daten</li>
            <li>Berichtigung unrichtiger Daten</li>
            <li>Löschung oder Einschränkung der Verarbeitung</li>
            <li>Widerspruch gegen die Verarbeitung</li>
            <li>Datenübertragbarkeit</li>
            <li>Beschwerde bei einer Datenschutzaufsichtsbehörde</li>
        </ul>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">8. Kontakt</h2>
        <p>Bei Fragen zum Datenschutz schreiben Sie bitte an:</p>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          datenschutz@deinprojekt.de
        </blockquote>
      </div>
    </div>
  );
}
