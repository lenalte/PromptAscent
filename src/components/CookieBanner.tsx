// components/CookieBanner.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/storageHelper';

type Consent = 'granted' | 'denied';

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    const stored = getLocalStorage('cookie_consent', null);
    if (stored === 'granted' || stored === 'denied') {
      setConsent(stored);
    }
  }, []);

  useEffect(() => {
    if (consent === null) return;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: consent });
    }
    setLocalStorage('cookie_consent', consent);
    console.log('Cookie Consent:', consent);
  }, [consent]);

  if (consent !== null) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 mx-auto my-4 max-w-screen-sm
                 flex flex-col sm:flex-row items-center justify-between
                 gap-4 bg-gray-700 px-4 py-3 rounded-lg shadow-lg"
    >
      <p className="text-gray-200 text-center">
        Wir verwenden Cookies für Analysen.{' '}
        <Link href="/info/cookies" className="underline text-sky-400">
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
