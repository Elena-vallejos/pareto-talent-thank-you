/**
 * Tiny analytics abstraction. Components call `track()`; adapters decide where it goes.
 * Built-in adapters are no-ops unless the matching script is on the page, so you can add
 * GTM / GA4 / Meta Pixel later without touching any component.
 */

export type AnalyticsEvent =
  | "page_view"
  | "assessment_started"
  | "question_answered"
  | "assessment_completed"
  | "lead_magnet_requested"
  | "lead_magnet_downloaded"
  | "booking_cta_clicked";

export type EventProps = Record<string, string | number | boolean | undefined>;
export type AnalyticsAdapter = (event: AnalyticsEvent, props: EventProps) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const consoleAdapter: AnalyticsAdapter = (event, props) => {
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props);
};

/** Google Tag Manager / dataLayer. */
const dataLayerAdapter: AnalyticsAdapter = (event, props) => {
  window.dataLayer?.push({ event, ...props });
};

/** Google Analytics 4 via gtag.js. */
const gtagAdapter: AnalyticsAdapter = (event, props) => {
  window.gtag?.("event", event, props);
};

/** Meta Pixel. `lead_magnet_requested` maps to the standard "Lead" event. */
const metaPixelAdapter: AnalyticsAdapter = (event, props) => {
  if (!window.fbq || event === "page_view") return; // the Pixel base code tracks PageView itself
  if (event === "lead_magnet_requested") window.fbq("track", "Lead", props);
  else window.fbq("trackCustom", event, props);
};

const adapters: AnalyticsAdapter[] = [consoleAdapter, dataLayerAdapter, gtagAdapter, metaPixelAdapter];

/** Plug in any other platform (e.g. a GoHighLevel tracking snippet). */
export function registerAnalyticsAdapter(adapter: AnalyticsAdapter) {
  adapters.push(adapter);
}

export function track(event: AnalyticsEvent, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  for (const adapter of adapters) {
    try {
      adapter(event, props);
    } catch {
      // Analytics must never break the experience.
    }
  }
}
