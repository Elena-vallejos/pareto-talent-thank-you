import type { LeadPayload } from "./types";

/**
 * Sends the lead to a GoHighLevel "Inbound Webhook" workflow trigger.
 * Runs on the server only, so the URL never reaches the browser.
 */
export async function postToGoHighLevel(url: string, payload: LeadPayload): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`GoHighLevel webhook responded with ${res.status}`);
  }
}
