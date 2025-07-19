'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Consent = 'granted' | 'denied';

export default function CookieBanner() {
    const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem('cookie_consent');
    if (stored === 'granted' || stored === 'denied') {
      setConsent(stored);
    }
  }, []);

  useEffect(() => {
    if (consent === null) return;
    window.localStorage.setItem('cookie_consent', consent);

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: consent,
      });
    }
  }, [consent]);

  if (!mounted) return null;

  if (consent !== null) {
    return null;
  }

  return (
    <div
      className="
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        max-w-lg md:max-w-xl lg:max-w-2xl w-full
        bg-gray-800 text-gray-100 p-8 rounded-2xl shadow-2xl
        flex flex-col items-center space-y-6 border border-gray-700
      "
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
    >
      <div className="space-y-2 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-1 text-primary">
          Cookies für wissenschaftliche Evaluation
        </h2>
        <p>
          Diese Plattform verwendet Cookies und Google Analytics ausschließlich zur anonymen Auswertung und Verbesserung im Rahmen einer wissenschaftlichen Bachelorarbeit. 
          Deine Daten werden <b>nicht</b> für Werbung oder kommerzielle Zwecke genutzt. Die Erhebung dient allein der Forschung und der Evaluation dieser Lernplattform.
        </p>
        <p>
          Du kannst die Nutzung von Analyse-Cookies ablehnen oder akzeptieren. Alle Details findest du in unserer{' '}
          <Link href="/legal/cookies" className="underline text-sky-400 hover:text-sky-300">
            Cookie-Info
          </Link>{' '}
          und der{' '}
          <Link href="/legal/datenschutz" className="underline text-sky-400 hover:text-sky-300">
            Datenschutzerklärung
          </Link>.
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          className="px-6 py-2 border border-gray-400 text-gray-200 rounded-lg hover:bg-gray-700 transition"
          onClick={() => setConsent('denied')}
        >
          Ablehnen
        </button>
        <button
          className="px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition"
          onClick={() => setConsent('granted')}
        >
          Akzeptieren
        </button>
      </div>
    </div>
  );
}
