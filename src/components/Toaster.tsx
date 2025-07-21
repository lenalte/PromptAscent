"use client";

import { ToastProvider, ToastViewport } from "./ui/toast";

// Du kannst ggf. noch weitere Toast-Komponenten importieren und hier verwenden

export default function Toaster() {
    return (
        <ToastProvider>
            <ToastViewport />
            {/* Hier ggf. noch weitere Toaster-Komponenten */}
        </ToastProvider>
    );
}
