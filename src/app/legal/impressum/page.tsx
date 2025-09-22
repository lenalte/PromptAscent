
export default function ImpressumPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-4 text-primary">Impressum</h1>

      <div className="space-y-6 text-base">
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Anbieter:in:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Vorname und Nachname des/der Verantwortlichen<br />
          Straße<br />
          Ort<br />
          Deutschland
        </blockquote>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Kontakt:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          E-Mail
        </blockquote>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Verantwortlich für den Inhalt:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Vorname und Nachname des/der Verantwortlichen<br />
          Anschrift wie oben
        </blockquote>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Haftungsausschluss:</h2>
        <p>
          Diese Plattform wird ausschließlich zu <strong>nicht-kommerziellen, wissenschaftlichen Zwecken</strong> im Rahmen einer Bachelorarbeit betrieben. Es besteht kein Anspruch auf Vollständigkeit, Aktualität oder Richtigkeit der Inhalte. Jegliche Haftung für Schäden, die aus der Nutzung der dargebotenen Informationen entstehen, wird ausgeschlossen.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Inhaltliche Quellen und Lizenzhinweis:</h2>
        <p>
          Teile der Aufgaben und Inhalte dieser Lernplattform basieren auf Materialien von{' '}
          <a href="https://learnprompting.org/docs/introduction" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">
            learnprompting.org
          </a>
          , lizenziert unter{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">
            CC BY-SA 4.0
          </a>
          .
        </p>
      </div>
    </div>
  );
}
