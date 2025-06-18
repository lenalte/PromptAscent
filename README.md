
# Prompt Ascent

This Next.js application helps users learn and practice prompt engineering skills through a structured, stage-based learning system.

## Features

- **Stage-Based Learning:** Each lesson is divided into 6 distinct stages: Verstehen (Understand), Anwenden (Apply), Variieren (Vary), Reflektieren (Reflect), Wiederholen (Repeat), and Anwenden & Reflektieren (Apply & Reflect).
- **Interactive Tasks:** Engage with various task types including informational snippets, multiple-choice questions, free-response validation, and prompt evaluation.
- **AI-Powered Feedback:** Get instant feedback and hints for free-response questions and prompt submissions, powered by AI.
- **Progress Tracking:** User progress is tracked per lesson and per stage, with visual indicators for stage completion status.
- **Points System:** Earn points for completing tasks and stages.

## Getting Started

To get started with the development server:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Environment Variables:**
    Copy the `.env.example` file (if one exists) to a new file named `.env` and fill in your Firebase and Google AI API keys:
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
3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) (or your specified port) with your browser to see the result.

You can start editing the main page by modifying `src/app/page.tsx`.

## Key Technologies

- [Next.js](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
- [Genkit](https://firebase.google.com/docs/genkit) - AI integration framework (used for lesson generation, prompt validation, and evaluation).
- [Firebase](https://firebase.google.com/) - Backend services (Authentication, Firestore for user progress).
- [TypeScript](https://www.typescriptlang.org/)

## Learn More

To learn more about the technologies used, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Genkit Documentation](https://firebase.google.com/docs/genkit) - learn about Genkit flows and AI integration.
- [Firebase Documentation](https://firebase.google.com/docs) - learn about Firebase services.
- [Shadcn/ui Documentation](https://ui.shadcn.com/docs) - learn about the UI components used.
```