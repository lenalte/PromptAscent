

export default function ImpressumPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-4 text-primary">Impressum</h1>
      <p className="text-muted-foreground mb-6">Angaben gemäß § 5 TMG</p>

      <div className="space-y-6 text-base">
        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Anbieter:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Lena Ertl<br />
          Musterstraße 1<br />
          80333 München<br />
          Deutschland
        </blockquote>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Kontakt:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Telefon: +49 (0) 123 456789<br />
          E-Mail: lertl@hm.edu
        </blockquote>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h2>
        <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground">
          Lena Ertl<br />
          Anschrift wie oben
        </blockquote>
        
        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">Haftungsausschluss:</h2>
        <p>
          Diese Plattform wird ausschließlich zu <strong>nicht-kommerziellen, wissenschaftlichen Zwecken</strong> im Rahmen einer Bachelorarbeit betrieben. Es besteht kein Anspruch auf Vollständigkeit, Aktualität oder Richtigkeit der Inhalte. Jegliche Haftung für Schäden, die aus der Nutzung der dargebotenen Informationen entstehen, wird ausgeschlossen.
        </p>
      </div>
    </div>
  );
}
