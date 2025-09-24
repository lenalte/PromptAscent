// Zieh die Measurement-ID aus den Public Env-Vars
const GA_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Pageview-Funktion, die in Client-Components aufgerufen wird
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

// Custom Event-Tracking-Funktion
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}) => {
  if (!GA_ID) return;
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};