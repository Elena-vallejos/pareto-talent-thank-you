import { NextResponse } from "next/server";
import { postToGoHighLevel } from "@/lib/ghl";
import { buildPayload } from "@/lib/payload";
import { validateSubmission } from "@/lib/validation";
import type { SubmitSuccess } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (error: string, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  // Honeypot: bots fill hidden fields. Pretend it worked, send nothing.
  if (body && typeof body === "object" && (body as { website?: unknown }).website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = validateSubmission(body);
  if (!parsed.ok) return fail(parsed.error, 422, { fields: parsed.fields });

  const pdfUrl = process.env.PARETO_TALENT_PDF_URL?.trim() || "";
  const webhookUrl = process.env.GOHIGHLEVEL_WEBHOOK_URL?.trim() || "";

  const { payload, segmentId, intent } = buildPayload({
    lead: parsed.data.lead,
    answers: parsed.data.answers,
    submissionId: parsed.data.submissionId,
    guideUrl: pdfUrl,
  });

  if (!pdfUrl) {
    // We still save the lead; the page falls back to "check your inbox".
    console.error("[pareto] PARETO_TALENT_PDF_URL is not set.");
  }

  if (!webhookUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error("[pareto] GOHIGHLEVEL_WEBHOOK_URL is not set.");
      return fail("We couldn't save your answers right now. Please try again in a few minutes.", 500);
    }
    console.info("[pareto] GOHIGHLEVEL_WEBHOOK_URL not set. Payload that would be sent:\n", payload);
  } else {
    try {
      await postToGoHighLevel(webhookUrl, payload);
    } catch (err) {
      console.error("[pareto] Webhook failed:", err);
      return fail("We couldn't send your answers. Please try again.", 502);
    }
  }

  const result: SubmitSuccess = {
    ok: true,
    segment: segmentId,
    intent_score: intent.score,
    intent_level: intent.level,
    pdf_url: pdfUrl || null,
  };
  return NextResponse.json(result);
}
