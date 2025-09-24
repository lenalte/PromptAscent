"use client";

import { ToastProvider, ToastViewport } from "./ui/toast";

export default function Toaster() {
    return (
        <ToastProvider>
            <ToastViewport />
            {/* Hier ggf. noch weitere Toaster-Komponenten */}
        </ToastProvider>
    );
}
