// src/app/not-found.tsx
"use client";
import { Suspense } from "react";

function NotFoundInner() {
    return (
        <div className="text-center py-24">
            <h1 className="text-3xl font-bold mb-4">404 – Seite nicht gefunden</h1>
            <p>Die Seite existiert nicht oder wurde entfernt.</p>
        </div>
    );
}

export default function NotFoundPage() {
    return (
        <Suspense fallback={null}>
            <NotFoundInner />
        </Suspense>
    );
}
