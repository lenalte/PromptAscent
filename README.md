
# Prompt Ascent

Diese Next.js-Anwendung hilft Nutzenden dabei, durch ein strukturiertes, stufenbasiertes Lernsystem Kenntnisse im Bereich Prompt Engineering zu erwerben und zu üben.

## Features

- **Stufenbasiertes Lernen:** Jede Lektion ist in 6 verschiedene Stufen unterteilt: Verstehen, Anwenden, Variieren, Reflektieren, Wiederholen und Meistern.
- **Interaktive Aufgaben:** Bearbeite verschiedene Aufgabentypen, darunter Informationsschnipsel, Multiple-Choice-Fragen, Freitext-Validierung und sofortige Bewertung.
- **KI-gestütztes Feedback:** Erhalte sofortiges Feedback und Hinweise zu Freitextfragen und sofortigen Einreichungen, unterstützt durch KI.
- **Fortschrittsverfolgung:** Der Fortschritt der Benutzer wird pro Lektion und pro Stufe verfolgt, mit visuellen Indikatoren für den Status der Stufenabschlüsse.
- **Punktesystem:** Sammle Punkte für das Abschließen von Aufgaben und Stufen.

## Getting Started

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
