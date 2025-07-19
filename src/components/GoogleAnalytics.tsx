// components/GoogleAnalytics.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { pageview } from '@/lib/gtagHelper';

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Jedes Mal, wenn sich URL oder Query ändern, senden wir einen Pageview
  useEffect(() => {
    if (!GA_ID) {
      console.warn('[GoogleAnalytics] NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ist nicht gesetzt');
      return;
    }
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    pageview(url);
  }, [pathname, searchParams, GA_ID]);

  if (!GA_ID) return null;

  return (
    <>
      {/* Lädt das gtag.js Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />

      {/* Initialisiert gtag und setzt Default-Consent */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Standard auf "denied", bis der Nutzer zustimmt
          gtag('consent', 'default', {
            'analytics_storage': 'denied'
          });

          // Konfiguriere GA mit deiner Measurement ID
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
