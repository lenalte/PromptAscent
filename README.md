
# Prompt Ascent

Diese Next.js-Anwendung hilft Nutzenden dabei, durch ein strukturiertes, stufenbasiertes Lernsystem Kenntnisse im Bereich Prompt Engineering zu erwerben und zu üben. Die Lerninhalte basieren auf dem [Prompt Engineering Guide von Learn Prompting](https://learnprompting.org/docs/introduction).

## Features

- **Stufenbasiertes Lernen:** Jede Lektion ist in 6 verschiedene Stufen unterteilt: Verstehen, Anwenden, Variieren, Reflektieren, Wiederholen und Meistern.
- **Interaktive Aufgaben:** Bearbeite verschiedene Aufgabentypen, darunter Informationsschnipsel, Multiple-Choice-Fragen, Freitext-Validierung und sofortige Bewertung.
- **KI-gestütztes Feedback:** Erhalte sofortiges Feedback und Hinweise zu Freitextfragen und sofortigen Einreichungen, unterstützt durch KI.
- **Fortschrittsverfolgung:** Der Fortschritt der Benutzer wird pro Lektion und pro Stufe verfolgt, mit visuellen Indikatoren für den Status der Stufenabschlüsse.
- **Punktesystem:** Sammle Punkte für das Abschließen von Aufgaben und Stufen.

## Erste Schritte (lokal)

Um mit dem Entwicklungsserver zu beginnen:

1.  **Installiere Abhängigkeiten:**
    ```bash
    npm install
    ```
2.  **Umgebungsvariablen einrichten:**
    Kopiere die `.env.example` Datei in eine neue Datei namens `.env` und befülle sie mit deinen Firebase und Goolge AI API keys:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional

    GOOGLE_GENAI_API_KEY="YOUR_GOOGLE_AI_API_KEY"
    ```
3.  **Entwicklungsserver ausführen:**
    ```bash
    npm run dev
    ```

Öffne [http://localhost:9002](http://localhost:9002) (oder den entsprechenden angegebenen Port) im Browser um die Anwendung zu sehen.

## Deployment (Firebase App Hosting)
> **Hinweis:** Die Anwendung kann auch mit anderen Deployment-Optionen (z. B. Vercel) bereitgestellt werden. Im Folgenden wird Firebase App Hosting verwendet.

1. **Firebase CLI installieren**
    ```bash
    npm i -g firebase-tools
    firebase login
    firebase use <PROJECT_ID>
    ```
2. **Secrets setzen (für Google Gemini Key)**
    ```bash
    firebase apphosting:secrets:set GOOGLE_GENAI_API_KEY
    firebase apphosting:secrets:grantaccess GOOGLE_GENAI_API_KEY --backend=production
    ```
3. **Deploy starten**
    ```bash
    firebase deploy --only apphosting
    ```
4. **Rollback falls nötig**
    Firebase Console → App Hosting → Deployments → „Rollback“.

## Inhalte anpassen (Lektionen)

Die Lektionsinhalte liegen in /src/data/generated-lessons (Jede lesson als JSON-Datei).

**Grundstruktur einer Lektion:**
```bash
{
  "id": "lesson1",
  "title": "Was ist Generative KI?",
  "description": "Kurzbeschreibung der Lektion",
  "stages": [
    {
      "id": "stage1",
      "title": "Stage 1: Verstehen",
      "items": [ /* Aufgaben siehe unten */ ]
    }
    /* ... weitere Stages ... */
  ]
}
```
→ id der Lektion: eindeutig (z. B. lesson1, lesson2 …)
→ stages: typischerweise 6 (Verstehen, Anwenden, Variieren, Reflektieren, Wiederholen, Meistern)

Änderungen lokal machen, beim nächsten Deploy werden die neuen Inhalte ausgespielt.

Achtung: Strukturänderungen sollten zu den Komponenten passen, sonst laufen Tasks ins Leere.

**Aufgabentypen (Items)**
Jedes Item hat mindestens:
- type – Typ der Aufgabe
- id – eindeutig innerhalb der Lektion
- title – Anzeigename
- pointsAwarded – Punkte bei Erfolg
- optional pointsForIncorrect – Punkte bei Fehlversuch (meist 0)

1. **Informationstext (informationalSnippet)**
    ```bash
    {
      "type": "informationalSnippet",
      "id": "s1_info1",
      "title": "Was ist KI?",
      "content": "Kurzer erklärender Text …",
      "pointsAwarded": 1
    }
    ```
    **Pflichtfelder:** title, content, pointsAwarded
2. **Multiple Choice (multipleChoice)**
    ```bash
    {
      "type": "multipleChoice",
      "id": "s1_mcq1",
      "title": "KI im Alltag erkennen",
      "question": "In welchem Fall ist KI typischerweise NICHT beteiligt?",
      "options": [
        "Spotify empfiehlt Songs",
        "FaceID entsperrt dein Handy",
        "Du speicherst ein Word-Dokument",
        "YouTube empfiehlt ein Video"
      ],
      "correctOptionIndex": 2,
      "pointsAwarded": 3,
      "pointsForIncorrect": 0
    }
    ```
    **Pflichtfelder:** question, options[] (≥2), correctOptionIndex (Index in options)
3. **Freitextfrage (freeResponse)**
    ```bash
    {
      "type": "freeResponse",
      "id": "s1_fr1",
      "title": "KI vs. klassische Software",
      "question": "Nenne einen Unterschied …",
      "expectedAnswer": "… Beispiel-/Referenzantwort …",
      "pointsAwarded": 5,
      "pointsForIncorrect": 0
    }
    ```
    **Pflichtfelder:** question, expectedAnswer
    → Die App nutzt Genkit/Gemini, um Antworten gegen expectedAnswer zu bewerten.
5. **Prompting-Aufgabe (promptingTask)**
    ```bash
    {
      "type": "promptingTask",
      "id": "s3_pt1",
      "title": "Prompt schreiben: Bildbeschreibung",
      "taskDescription": "Anweisung an Nutzer:innen …",
      "evaluationGuidance": "Worauf die Bewertung achten soll …",
      "pointsAwarded": 7,
      "pointsForIncorrect": 0
    }
    ```
    **Pflichtfelder:** taskDescription, evaluationGuidance
    → Bewertung erfolgt serverseitig über Genkit/Gemini anhand deiner Guidance.

**Neue Lektion anlegen**
- Datei kopieren: lesson1.json → lesson2.json
- id, title, description anpassen
- Stages & Items eintragen (IDs ohne Kollision)

## Zentrale Technologien

- [Next.js](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Wiederverwendbare Komponenten, die mit Radix UI und Tailwind CSS erstellt wurden.
- [Genkit](https://firebase.google.com/docs/genkit) - KI-Integrationsframework (wird für die Validierung von Prompts, sowie Freitextantworten und zur Bewertung dieser verwendet).
- [Firebase](https://firebase.google.com/) - Backend-Dienste (Authentifizierung, Firestore für den Benutzerfortschritt).
- [TypeScript](https://www.typescriptlang.org/)

## Weitere Informationen

Weitere Informationen zu den verwendeten Technologien finden sich in den folgenden Ressourcen:

- [Next.js Documentation](https://nextjs.org/docs) - Erfahre mehr über die Funktionen und die API von Next.js.
- [Genkit Documentation](https://firebase.google.com/docs/genkit) - Erfahre mehr über Genkit-Abläufe und KI-Integration.
- [Firebase Documentation](https://firebase.google.com/docs) - Erfahre mehr über Firebase-Dienste.
- [Shadcn/ui Documentation](https://ui.shadcn.com/docs) - Erfahre mehr über die verwendeten UI-Komponenten.
