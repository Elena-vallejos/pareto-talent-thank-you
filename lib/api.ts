import type { SubmitBody, SubmitSuccess } from "./types";

export class SubmitError extends Error {}

export async function submitAssessment(body: SubmitBody): Promise<SubmitSuccess> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      throw new SubmitError(json?.error ?? "We couldn't send your answers. Please try again.");
    }
    return json as SubmitSuccess;
  } catch (err) {
    if (err instanceof SubmitError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new SubmitError("This is taking longer than expected. Your answers are saved, so you can try again.");
    }
    throw new SubmitError("We couldn't reach the server. Check your connection. Your answers are saved.");
  } finally {
    clearTimeout(timeout);
  }
}
