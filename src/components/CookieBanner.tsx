'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
        bg-white text-background p-8 rounded-2xl shadow-2xl
        flex flex-col items-center space-y-6 border border-[hsl(var(--background))]
      "
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
    >
      <Image
        src="/assets/images/Cookie.png"
        alt="Sad pixel art cookie"
        width={100}
        height={100}
        data-ai-hint="pixelart cookie"
        className="mb-2"
      />
      <div className="space-y-2 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-1 text-background">
          Bitte akzeptiere meine Cookies
        </h2>
        <p className="text-background">
          Zur Verbesserung dieser Website verwenden wir Google Analytics, um anonyme Nutzungsdaten zu erheben.
          Deine Daten werden nicht für Werbung oder Profilbildung genutzt. Die Auswertung dient ausschließlich der Optimierung der Anwendung.
        </p>
        <p className="text-background">
          Bitte unterstütze mich, indem du der Nutzung dieser Cookies zustimmst.
          Mehr Infos findest du {' '}
          <Link href="/legal/datenschutz" className="underline text-sky-800 hover:text-sky-500">
            hier
          </Link>{' '}
          .
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          onClick={() => setConsent('denied')}
        >
          Ablehnen
        </button>
        <button
          className="px-6 py-2 bg-foreground text-white rounded-lg font-semibold hover:bg-background transition"
          onClick={() => setConsent('granted')}
        >
          Akzeptieren
        </button>
      </div>
    </div>
  );
}
