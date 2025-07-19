// components/CookieBanner.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Consent = 'granted' | 'denied';

export default function CookieBanner() {
  // null = noch keine Entscheidung getroffen
  const [consent, setConsent] = useState<Consent | null>(null);

  // 1) Beim ersten Mount aus dem localStorage lesen
  useEffect(() => {
    const stored = window.localStorage.getItem('cookie_consent');
    if (stored === 'granted' || stored === 'denied') {
      setConsent(stored);
    }
    // bleibt null, wenn nichts gespeichert war
  }, []);

  // 2) Wenn der Nutzer klickt: speichern & gtag-Consent updaten
  useEffect(() => {
    if (consent === null) return;

    // localStorage
    window.localStorage.setItem('cookie_consent', consent);

    // Google Analytics Consent-Update
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: consent,
      });
    }
  }, [consent]);

  // 3) Banner nur zeigen, solange keine Entscheidung vorliegt
  if (consent !== null) {
    return null;
  }

  // 4) UI des Banners
  return (
    <div
      className="fixed bottom-0 left-0 right-0 mx-auto my-4 max-w-screen-sm
                 flex flex-col sm:flex-row items-center justify-between
                 gap-4 bg-gray-700 px-4 py-3 rounded-lg shadow-lg z-50"
    >
      <p className="text-gray-200 text-center">
        Wir verwenden Cookies für Analysen.{' '}
        <Link href="/legal/cookies" className="underline text-sky-400">
          Mehr dazu
        </Link>
      </p>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 border border-gray-500 text-gray-300 rounded"
          onClick={() => setConsent('denied')}
        >
          Ablehnen
        </button>
        <button
          className="px-4 py-2 bg-sky-500 text-white rounded"
          onClick={() => setConsent('granted')}
        >
          Akzeptieren
        </button>
      </div>
    </div>
  );
}
