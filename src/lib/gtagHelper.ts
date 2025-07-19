// lib/gtagHelper.ts

// Zieh die Measurement-ID aus den Public Env-Vars
const GA_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Pageview-Funktion, die du in deinen Client-Components aufrufst
export const pageview = (url: string) => {
  if (!GA_ID) {
    console.warn('[gtag] Missing GA_ID, pageview not sent');
    return;
  }
  // Existiert window und gtag?
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, {
      page_path: url,
    });
  }
};
