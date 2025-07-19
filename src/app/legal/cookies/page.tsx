import Link from 'next/link';

export default function CookieInfoPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-4 text-primary">Cookie-Hinweis</h1>
      <p className="text-muted-foreground mb-6"><strong>Stand:</strong> Juli 2025</p>

      <div className="space-y-6 text-base">
        <p>
          Diese Plattform ist Teil einer wissenschaftlichen Untersuchung im Rahmen einer <strong>Bachelorarbeit</strong>. Hier erfährst du, welche Cookies und Analyse-Tools verwendet werden und warum dies notwendig ist.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">1. Was sind Cookies?</h2>
        <p>
          Cookies sind kleine Textdateien, die von deinem Browser auf deinem Gerät gespeichert werden, wenn du meine Plattform besuchst. Sie richten keinen Schaden an und enthalten keine Schadsoftware.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">2. Welche Cookies werden gesetzt?</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Notwendige Cookies:</strong> 
            Diese sind technisch erforderlich, damit die Plattform funktioniert (z.B. für Login, Speicherung deines Fortschritts).
          </li>
          <li>
            <strong>Analyse-Cookies (Google Analytics):</strong>
            Mit deiner Einwilligung setze ich Google Analytics ein, um anonymisierte Nutzungsstatistiken zu erfassen. Dies dient ausschließlich der wissenschaftlichen Auswertung im Rahmen der Bachelorarbeit und hilft, die Plattform zu verbessern. Es werden keine personenbezogenen Daten ohne deine ausdrückliche Zustimmung gespeichert.
          </li>
        </ul>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">3. Zweck der Cookies und Analyse</h2>
        <p>
          Die Erhebung von Daten erfolgt ausschließlich zu wissenschaftlichen Zwecken, um die Nutzung und Wirksamkeit der Plattform zu evaluieren. Eine Nutzung zu Werbezwecken oder Weitergabe an Dritte findet nicht statt.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">4. Verwaltung deiner Einwilligung</h2>
        <p>
          Du kannst deine Einwilligung zu Analyse-Cookies jederzeit über den Cookie-Banner auf dieser Plattform oder über die Einstellungen deines Browsers anpassen oder widerrufen.
        </p>

        <hr className="my-6 border-border" />

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-primary">5. Weitere Informationen</h2>
        <p>
          Ausführliche Informationen zum Datenschutz findest du in der {' '}
          <Link
            href="/info/datenschutz"
            className="underline text-sky-400 hover:text-sky-300 transition"
          >
            Datenschutzerklärung
          </Link>.
        </p>
      </div>
    </div>
  );
}
