// app/testlevelcomplete/page.tsx
'use client';

import { LevelCompleteScreen } from '@/components/LevelCompleteScreen';
import { LessonCompleteScreen } from "@/components/LessonCompleteScreen";

export default function TestLevelComplete() {
    return (

        <LevelCompleteScreen
            onGoHome={() => alert('Zurück zur Übersicht!')}
            levelTitle="Basics"
            badgeName="Rocket Badge"
            badgeImageUrl="/assets/images/Level1_badge.png" // Beispiel-Bild!
        />
    );
}
