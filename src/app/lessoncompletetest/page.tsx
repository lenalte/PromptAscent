// app/test-lesson-complete/page.tsx

"use client";
import { LessonCompleteScreen } from "@/components/LessonCompleteScreen";

export default function TestLessonComplete() {
    return (
        <LessonCompleteScreen
            onGoHome={() => alert("Zurück zur Übersicht geklickt!")}
        />
    );
}
