
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
          Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung personenbezogener Daten auf der Plattform <strong>„Prompt-Ascent“</strong>. Die Nutzung erfolgt im Rahmen einer <strong>Bachelorarbeit</strong> an der Hochschule für angewandte Wissenschaften München und dient ausschließlich zu <strong>Evaluations- und Testzwecken</strong>. Die Plattform wird für ca. 1–2 Monate öffentlich zugänglich sein.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">1. Verantwortlicher</h2>
        <p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Lena Ertl<br />
          Hochschule für angewandte Wissenschaften München<br />
          E-Mail: lertl@hm.edu
        </blockquote>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">2. Zweck der Verarbeitung</h2>
        <p>
          Die Plattform dient der Durchführung eines wissenschaftlichen Tests zur <strong>Gamifizierung beim Erlernen von Prompt Engineering für Sprachmodelle</strong>. Die erhobenen Daten werden ausschließlich zu Forschungs- und Evaluationszwecken verwendet und nach Abschluss des Projekts gelöscht.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">3. Welche Daten werden erhoben?</h2>
        <p><strong>Folgende Daten werden verarbeitet:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>E-Mail-Adresse:</strong> zur Authentifizierung via Firebase Auth (Login über E-Mail-Link, kein Passwort).</li>
          <li><strong>Benutzername & Avatar:</strong> Angabe für das Nutzerprofil.</li>
          <li><strong>Nutzungsverhalten:</strong> z. B. gelöste Aufgaben, Fortschritt (Levels, Stages, Lessons), Klicks auf Buttons, Zeitpunkte.</li>
          <li><strong>Prompt-Eingaben:</strong> werden ausschließlich zur automatisierten Bewertung an Google Gemini (Vertex AI) gesendet und <strong>nicht dauerhaft gespeichert</strong>.</li>
          <li><strong>Antworten auf Freitextaufgaben & Prompting-Aufgaben:</strong> werden <strong>nicht dauerhaft gespeichert</strong>, sondern ausschließlich zur Bewertung mit Gemini genutzt.</li>
          <li><strong>Antworten auf Umfragen (Likert-Skalen):</strong> werden <strong>anonymisiert</strong> gespeichert und <strong>können nicht mit Ihrem Nutzerkonto verknüpft werden</strong>.</li>
          <li><strong>Analyse-Daten via Google Analytics:</strong> zur Auswertung der Nutzung der Plattform.</li>
        </ul>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">4. Cookies & Tracking-Technologien</h2>
        <p>
          Beim Besuch der Plattform werden Cookies und ähnliche Technologien eingesetzt, um den technischen Betrieb zu gewährleisten (z. B. Session-Cookies) und – <strong>nur mit Ihrer Einwilligung</strong> – zur anonymisierten Auswertung des Nutzerverhaltens (Google Analytics). Beim ersten Besuch wird Ihnen ein Cookie-Banner angezeigt, mit dem Sie Ihre Einwilligung erteilen oder verweigern können. Sie können Ihre Entscheidung jederzeit in den Cookie-Einstellungen widerrufen.
        </p>
        
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">5. Hosting und Drittanbieter</h2>
        <h3 className="text-xl font-semibold mt-4 text-secondary">a) Firebase (Google LLC)</h3>
        <p>Diese Plattform nutzt folgende Firebase-Dienste:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Firebase Authentication</li>
          <li>Firestore (Cloud-Datenbank)</li>
          <li>Firebase Hosting</li>
          <li>Firebase Cloud Functions</li>
        </ul>
        <p className="mt-2"><strong>Anbieter:</strong> Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
        <p><strong>Datenübertragung in ein Drittland:</strong> Die Daten können auf Servern in den USA verarbeitet werden. Google bietet für die Übermittlung geeignete Garantien (EU-Standardvertragsklauseln).</p>
        <p>Weitere Informationen: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Firebase Privacy</a></p>

        <h3 className="text-xl font-semibold mt-4 text-secondary">b) Google Gemini (Vertex AI)</h3>
        <p>Zur automatisierten Auswertung der Nutzereingaben wird die API von <strong>Google Gemini (Vertex AI)</strong> genutzt. Prompt-Eingaben werden zur Analyse temporär an Google übermittelt, jedoch <strong>nicht dauerhaft gespeichert</strong>.</p>
        <p>Weitere Informationen: <a href="https://cloud.google.com/vertex-ai/docs/general/vertexai-security-controls?hl=de" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Vertex AI Privacy & Security</a></p>

        <h3 className="text-xl font-semibold mt-4 text-secondary">c) Google Analytics</h3>
        <p>Zur anonymisierten Analyse des Nutzerverhaltens nutzen wir Google Analytics. Die IP-Adresse wird gekürzt verarbeitet. Die Daten helfen ausschließlich, die Plattform im Rahmen der Bachelorarbeit zu evaluieren.</p>
        <p><strong>Sie können der Nutzung über das Cookie-Banner oder Ihre Browsereinstellungen (z. B. „Do-Not-Track“ oder Opt-out) widersprechen.</strong></p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">6. Rechtsgrundlage der Verarbeitung</h2>
        <p>Die Verarbeitung Ihrer Daten erfolgt auf Basis von <strong>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</strong>.</p>
        <p>Sie nehmen freiwillig an der Plattform teil und können Ihre Einwilligung jederzeit widerrufen.</p>
        
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">7. Speicherdauer</h2>
        <ul className="list-disc list-inside space-y-1">
            <li><strong>Personenbezogene Daten (z. B. E-Mail, Nutzername, Fortschritt):</strong> werden <strong>nach Abschluss der Bachelorarbeit (spätestens 3 Monate nach Beginn der Erhebung)</strong> vollständig gelöscht.</li>
            <li><strong>Prompt-Eingaben und Freitextantworten:</strong> werden <strong>nicht dauerhaft gespeichert</strong>.</li>
            <li><strong>Anonyme Umfrage-Antworten:</strong> werden <strong>unverknüpft zum Nutzerkonto</strong> gespeichert und nach Abschluss der Auswertung gelöscht.</li>
            <li>Eine <strong>Weitergabe an Dritte</strong> erfolgt nicht.</li>
        </ul>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">8. Empfänger der Daten / Datenübermittlung</h2>
        <p>Die Verarbeitung erfolgt auf Servern von Google (Firebase, Gemini, Analytics), die auch in den USA stehen können. Die Übermittlung erfolgt auf Grundlage der EU-Standardvertragsklauseln.</p>
        
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">9. Ihre Rechte</h2>
        <p>Sie haben gemäß DSGVO folgende Rechte:</p>
        <ul className="list-disc list-inside space-y-1">
            <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
            <li><strong>Löschung</strong> („Recht auf Vergessenwerden“, Art. 17 DSGVO)</li>
            <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
            <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
            <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
            <li><strong>Beschwerde</strong> bei einer Datenschutzaufsichtsbehörde</li>
        </ul>

        <hr className="my-6 border-border" />
        
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">10. Widerruf der Einwilligung</h2>
        <p>Sie können Ihre Einwilligung zur Datenverarbeitung jederzeit mit Wirkung für die Zukunft widerrufen.</p>
        <p>Bitte kontaktieren Sie dazu den Verantwortlichen (siehe oben).</p>
        
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">11. Kontakt</h2>
        <p>Bei Fragen zum Datenschutz, zum Widerruf der Einwilligung oder zur Wahrnehmung Ihrer Rechte schreiben Sie bitte an:</p>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Hochschule für angewandte Wissenschaften München<br />
          E-Mail: lertl@hm.edu
        </blockquote>
      </div>
    </div>
  );
}
