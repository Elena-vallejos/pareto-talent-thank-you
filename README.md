# Pareto Talent: Thank You / Lead Qualification page

Guided founder assessment that follows the first lead-capture form, scores and segments the lead,
sends everything to GoHighLevel through a server-side route, and unlocks the Pareto Talent Guide PDF.

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3. Deploys to Vercel with no extra config.

## 1. Run it

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev                  # http://localhost:3000
npm test                     # segmentation, scoring, validation, payload
npm run typecheck
```

Test with lead data in the URL:
`http://localhost:3000/?first_name=Ana&email=ana@example.com&company=Acme&role=CEO`

Without `GOHIGHLEVEL_WEBHOOK_URL`, development mode logs the payload to the terminal instead of sending it.

## 2. Environment variables

| Variable | Where | What it does |
|---|---|---|
| `GOHIGHLEVEL_WEBHOOK_URL` | server only | Paste the GoHighLevel Inbound Webhook URL here. Never reaches the browser. |
| `PARETO_TALENT_PDF_URL` | server only | Public URL of the guide PDF. Returned to the page only after a successful submission and also sent to GHL as `guide_url`. |
| `NEXT_PUBLIC_PRIVACY_URL` | public | Link behind "Privacy Policy" (optional, defaults to `#`). |
| `NEXT_PUBLIC_BOOKING_URL` | public | Optional. Shows a "Book a conversation" button to leads who chose to explore or score HIGH. |

On Vercel: Project > Settings > Environment Variables. Redeploy after changing them.

## 3. Connect GoHighLevel

1. **First form redirect.** Make the first form redirect to this page and pass the lead's data:
   `https://YOUR-DOMAIN/?first_name={{contact.first_name}}&email={{contact.email}}&company={{contact.company_name}}&role={{contact.role}}`
   If the data doesn't arrive, the page asks for first name and email at the start of the chat, so no lead is lost.
2. **Inbound webhook.** In GHL: Automation > Workflows > new workflow > trigger **Inbound Webhook**. Copy its URL into `GOHIGHLEVEL_WEBHOOK_URL`.
3. **Custom fields.** Create these contact custom fields (text fields are fine; dropdowns must match the option text exactly):

   | Payload key | GHL field |
   |---|---|
   | `role` | Role |
   | `business_stage` | Business Stage |
   | `biggest_challenge` | Biggest Challenge |
   | `improvement_priority` | Improvement Priority |
   | `founder_statement` | Founder Statement |
   | `talent_interest` | Talent Interest |
   | `desired_outcome` | Desired Outcome |
   | `explore_application` | Explore Application |
   | `lead_source` | Lead Source |
   | `project` | Project |
   | `pareto_talent_segment` | Pareto Talent Segment |
   | `intent_score` / `intent_level` | Intent Score / Intent Level |

4. **Workflow actions.** Send a test submission first so GHL learns the fields, then add:
   - *Create/Update Contact* with `first_name`, `email`, `company` and the custom fields above.
   - *Add Tag* from the `tags` array (e.g. `pareto-talent-lead-magnet`, `segment-overloaded-founder`, `intent-high`, `stage-scaling`, `explore-yes`).
   - *If/Else* on `pareto_talent_segment` / `intent_level` for segmentation or a sales follow-up.
   - *Send Email* (below).
5. **Email.** Subject: `Your Pareto Talent Guide is Ready`. Body:

   > Hi {first name},
   >
   > Thank you for completing the Pareto Talent assessment.
   >
   > Your guide is ready. Use it to identify where your strengths can create the greatest leverage in your business.
   >
   > **[Download My Pareto Talent Guide]** (link to the webhook's `guide_url`)
   >
   > As you go through it, pay particular attention to the activities where your contribution creates disproportionate value.
   >
   > — Mara Elena Vallejos

   Pick the webhook values with GHL's variable picker (they usually appear under `inboundWebhookRequest`).
   Email is sent by GHL, so no email credentials exist in this app.

Every submission also carries `submission_id`, so the workflow can ignore duplicates.

## 4. Payload sent to GHL

```json
{
  "first_name": "", "email": "", "company": "", "role": "",
  "business_stage": "", "biggest_challenge": "", "improvement_priority": "",
  "founder_statement": "", "talent_interest": "", "desired_outcome": "", "explore_application": "",
  "lead_source": "Pareto Talent Lead Magnet",
  "project": "FP_MaraElenaVallejos_Pareto talent lead magnet",

  "registered_role": "", "pareto_talent_segment": "", "intent_score": 0, "intent_level": "LOW",
  "tags": [], "guide_url": "", "submission_id": "", "submitted_at": ""
}
```

`role` is the role picked in the assessment; the role from the first form is kept as `registered_role`.
Segment and score are **recomputed on the server** from the raw answers, never trusted from the browser.

## 5. Segmentation and score

`lib/segmentation.ts`: each answer adds points to a segment and the highest total wins
(statement answer = 3, challenge = 2, priority/stage = 1-2). Ties follow the order
Overloaded, Clarity, Delegation, Leverage, Growth. No match defaults to Clarity Seeker.
The rules in the brief are all there; a few extra mappings cover answers the brief left unassigned
(for example "I struggle to identify my strongest advantage" counts toward Clarity Seeker and
"I need better systems" toward Delegation / Team Leader). They're marked in the file, so adjust freely.

`lib/scoring.ts`: interest 1-4, +2 if they want to explore. 0-2 LOW, 3-4 MEDIUM, 5-6 HIGH.

## 6. Analytics

`lib/analytics.ts` exposes `track(event, props)`. Events: `page_view`, `assessment_started`, `question_answered`,
`assessment_completed`, `lead_magnet_requested`, `lead_magnet_downloaded`, `booking_cta_clicked`.
Adapters already push to `dataLayer` (GTM), `gtag` (GA4) and `fbq` (Meta Pixel) when those scripts are on the page;
add the scripts to `app/layout.tsx` and events flow with no other changes. Use `registerAnalyticsAdapter()` for anything else.
Email addresses and free-text answers are never sent to analytics.

## 7. Where things live

```
app/            page, layout, global CSS, api/submit/route.ts (server-side webhook call)
components/     Assessment (state), QuestionCard, ChatMessage, OptionButton, ProgressBar, TextInput,
                Textarea, ResultCard, LeadMagnetCTA, LoadingState, SuccessState, ErrorState, Hero, ...
lib/            questions (all copy + options), segmentation, scoring, validation, payload, ghl, analytics
public/         logo-cream.png (on purple), logo-plum.png (on cream)
```

To change a question, an option or a chat reply, edit `lib/questions.ts` only.

## 8. Built-in safeguards

- Webhook URL, PDF URL and any credentials stay on the server; the browser only calls `/api/submit`.
- Server validates every answer against the allowed options, and trims/limits all text.
- Submit button locks while sending; retries reuse the same `submission_id`.
- Answers persist in `sessionStorage`, so going back, reloading or a failed send never loses them.
- Hidden honeypot field silently drops bot submissions.
- If the PDF URL is missing, the lead is still saved and the page tells them to check their inbox.
- Page is `noindex`.
