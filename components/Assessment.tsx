"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { submitAssessment } from "@/lib/api";
import { EMPTY_LEAD, readLeadFromLocation } from "@/lib/lead";
import { INTRO_MESSAGE, QUESTIONS, QUESTION_COUNT, type AnswerKey, type Question } from "@/lib/questions";
import { computeIntent } from "@/lib/scoring";
import { computeSegment, SEGMENTS } from "@/lib/segmentation";
import { clearState, loadState, saveState, type Stage } from "@/lib/storage";
import { smart } from "@/lib/typography";
import type { Answers, Lead, SubmitSuccess } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { ContactCard } from "./ContactCard";
import { Hero } from "./Hero";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { SuccessState } from "./SuccessState";
import { SummaryCard } from "./SummaryCard";

type Status = "idle" | "submitting" | "error";

const TYPING_MS = 700;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export default function Assessment() {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<Stage>("questions");
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState<Lead>(EMPTY_LEAD);
  const [result, setResult] = useState<SubmitSuccess | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [missing, setMissing] = useState<AnswerKey[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [interacted, setInteracted] = useState(false);
  const [returnToSummary, setReturnToSummary] = useState(false);

  const submissionId = useRef("");
  const submitLock = useRef(false);
  const started = useRef(false);
  const completedTracked = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const activeRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);

  /* ---------- Restore state (URL data + session) ---------- */
  useEffect(() => {
    const url = readLeadFromLocation();
    let saved = loadState();
    if (saved && url.email && saved.contact.email && saved.contact.email.toLowerCase() !== url.email.toLowerCase()) {
      clearState(); // a different person opened the page: start clean
      saved = null;
    }
    const merged: Lead = {
      first_name: url.first_name || saved?.contact.first_name || "",
      email: url.email || saved?.contact.email || "",
      company: url.company || saved?.contact.company || "",
      role: url.role || saved?.contact.role || "",
    };
    setContact(merged);
    setAnswers(saved?.answers ?? {});
    submissionId.current = saved?.submissionId || newId();
    started.current = saved?.started ?? false;
    completedTracked.current = saved?.stage === "summary" || saved?.stage === "success";

    if (saved?.result) {
      setResult(saved.result);
      setStage("success");
    } else if (!merged.first_name || !merged.email) {
      setStage("contact");
    } else if (saved?.stage === "summary") {
      setStage("summary");
    } else {
      setStage("questions");
      setIndex(Math.min(Math.max(saved?.index ?? 0, 0), QUESTION_COUNT - 1));
    }
    setReady(true);
    track("page_view", { page: "pareto_talent_thank_you" });
    return () => window.clearTimeout(timer.current);
  }, []);

  /* ---------- Never lose answers ---------- */
  useEffect(() => {
    if (!ready) return;
    saveState({
      stage,
      index,
      answers,
      contact,
      submissionId: submissionId.current,
      started: started.current,
      result,
    });
  }, [ready, stage, index, answers, contact, result]);

  /* ---------- Analytics: completion ---------- */
  useEffect(() => {
    if (stage === "summary" && !completedTracked.current) {
      completedTracked.current = true;
      track("assessment_completed", {
        segment: SEGMENTS[computeSegment(answers)].value,
        intent_level: computeIntent(answers).level,
      });
    }
  }, [stage, answers]);

  /* ---------- Keep the newest message in view ---------- */
  useEffect(() => {
    if (!ready) return;
    if (firstScroll.current) {
      firstScroll.current = false;
      return;
    }
    const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
    if (stage === "success") {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const el = activeRef.current;
    if (!el) return;
    const tall = el.getBoundingClientRect().height > window.innerHeight * 0.75;
    el.scrollIntoView({ behavior, block: tall ? "start" : "end" });
  }, [ready, stage, index, pending]);

  /* ---------- Derived values ---------- */
  const submitting = status === "submitting";
  const canEdit = !pending && !submitting && (stage === "questions" || stage === "summary");
  const done = stage === "questions" ? index + (pending ? 1 : 0) : stage === "contact" ? 0 : QUESTION_COUNT;
  const pastCount = done;
  const reactionsUpTo = stage === "questions" ? index : stage === "contact" ? 0 : QUESTION_COUNT;
  const progressLabel =
    stage === "contact"
      ? "Before we begin"
      : stage === "questions"
        ? `Question ${Math.min(index + (pending ? 2 : 1), QUESTION_COUNT)} of ${QUESTION_COUNT}`
        : "All questions answered";
  const progressValue = stage === "questions" ? done : stage === "contact" ? 0 : QUESTION_COUNT;

  /* ---------- Actions ---------- */
  const trackAnswer = (q: Question, value: string) => {
    if (!started.current) {
      started.current = true;
      track("assessment_started");
    }
    track("question_answered", {
      question_id: q.id,
      question_number: QUESTIONS.indexOf(q) + 1,
      answer: q.kind === "choice" ? value : undefined, // free text is never sent to analytics
      answer_length: q.kind === "text" ? value.length : undefined,
    });
  };

  /** Show the typing indicator briefly, then move on. */
  const advance = () => {
    const last = index >= QUESTION_COUNT - 1;
    const backToSummary = returnToSummary;
    setInteracted(true);
    setPending(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setPending(false);
        if (backToSummary || last) {
          setReturnToSummary(false);
          setStage("summary");
        } else {
          setIndex((i) => i + 1);
        }
      },
      reducedMotion() ? 120 : TYPING_MS
    );
  };

  const choose = (q: Question, value: string) => {
    if (pending || submitting) return;
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    trackAnswer(q, value);
    advance();
  };

  const setText = (q: Question, value: string) => setAnswers((prev) => ({ ...prev, [q.id]: value }));

  const continueFrom = (q: Question) => {
    if (pending || submitting) return;
    const value = (answers[q.id] ?? "").trim();
    if (q.kind === "text") {
      setAnswers((prev) => ({ ...prev, [q.id]: value }));
      trackAnswer(q, value);
    }
    advance();
  };

  const goBack = () => {
    if (pending || submitting) return;
    setInteracted(true);
    if (returnToSummary) {
      setReturnToSummary(false);
      setStage("summary");
    } else if (index > 0) {
      setIndex(index - 1);
    }
  };

  const goTo = (i: number) => {
    if (!canEdit) return;
    setInteracted(true);
    setReturnToSummary(stage === "summary");
    setMissing([]);
    setErrorMessage("");
    setStatus("idle");
    setStage("questions");
    setIndex(i);
  };

  const finishContact = (lead: Lead) => {
    setContact((prev) => ({ ...prev, ...lead }));
    setInteracted(true);
    setStage("questions");
    setIndex(0);
  };

  const submit = async () => {
    if (submitLock.current || submitting) return;

    const absent = QUESTIONS.filter((q) => q.required && !(answers[q.id] ?? "").trim()).map((q) => q.id);
    if (absent.length) {
      setMissing(absent);
      return;
    }

    submitLock.current = true;
    setMissing([]);
    setErrorMessage("");
    setStatus("submitting");
    track("lead_magnet_requested", {
      segment: SEGMENTS[computeSegment(answers)].value,
      intent_level: computeIntent(answers).level,
    });

    try {
      const res = await submitAssessment({
        lead: contact,
        answers,
        submission_id: submissionId.current,
        website: honeypot,
      });
      setResult(res);
      setStatus("idle");
      setStage("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      submitLock.current = false;
    }
  };

  /* ---------- Render ---------- */
  const settledQuestions = QUESTIONS.slice(0, pastCount);
  const current = QUESTIONS[Math.min(index, QUESTION_COUNT - 1)];

  return (
    <div className="flex min-h-dvh flex-col bg-cream text-plum lg:flex-row">
      <Hero firstName={contact.first_name} stage={stage} done={progressValue} canNavigate={canEdit} onGoTo={goTo} />

      <main className="min-w-0 flex-1">
        {ready && stage !== "success" && (
          <div className="sticky top-0 z-20 border-b border-plum/10 bg-cream/95 px-5 py-3 backdrop-blur sm:px-8 lg:hidden">
            <ProgressBar value={progressValue} max={QUESTION_COUNT} label={progressLabel} />
          </div>
        )}

        <div className="mx-auto w-full max-w-2xl px-5 pb-28 pt-8 sm:px-8 lg:px-12 lg:pb-24 lg:pt-16">
          {ready && stage === "success" && result ? (
            <SuccessState
              result={result}
              email={contact.email}
              answers={answers}
              onDownload={() =>
                track("lead_magnet_downloaded", {
                  segment: SEGMENTS[result.segment].value,
                  intent_level: result.intent_level,
                })
              }
              onBookingClick={() => track("booking_cta_clicked", { intent_level: result.intent_level })}
            />
          ) : (
            <>
              <header className="mb-8">
                <p className="inline-flex rounded-full bg-plum px-3 py-1 text-sm font-semibold text-cream">Step 1 of 2</p>
                <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Discover Where Your Talent Creates the Most Value
                </h2>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-plum/85">
                  Before we send you your Pareto Talent Guide, answer a few quick questions so we can better understand
                  where you are and what kind of leverage you need.
                </p>
                <p className="mt-3 text-base font-semibold">Takes about 60&ndash;90 seconds.</p>
              </header>

              <div className="space-y-5">
                <div role="log" aria-live="polite" aria-relevant="additions" className="space-y-5">
                  <ChatMessage from="assistant">{INTRO_MESSAGE}</ChatMessage>

                  {ready &&
                    settledQuestions.map((q, i) => {
                      const answer = (answers[q.id] ?? "").trim();
                      return (
                        <Fragment key={q.id}>
                          <ChatMessage from="assistant">{smart(q.prompt)}</ChatMessage>
                          <ChatMessage
                            from="user"
                            muted={!answer}
                            onEdit={canEdit ? () => goTo(i) : undefined}
                            editLabel={`Edit answer: ${q.step}`}
                          >
                            {answer ? smart(answer) : "Skipped"}
                          </ChatMessage>
                          {i < reactionsUpTo && (
                            <ChatMessage from="assistant">{smart(answer ? q.reaction : (q.skippedReaction ?? q.reaction))}</ChatMessage>
                          )}
                        </Fragment>
                      );
                    })}
                </div>

                {ready && (
                  <div ref={activeRef} className="scroll-mb-6 scroll-mt-20">
                    {stage === "contact" && <ContactCard initial={contact} onDone={finishContact} />}

                    {stage === "questions" && pending && <ChatMessage from="assistant" typing />}

                    {stage === "questions" && !pending && (
                      <QuestionCard
                        key={current.id}
                        question={current}
                        value={answers[current.id] ?? ""}
                        onChoose={(v) => choose(current, v)}
                        onTextChange={(v) => setText(current, v)}
                        onContinue={() => continueFrom(current)}
                        onBack={index > 0 || returnToSummary ? goBack : undefined}
                        focusOnMount={interacted}
                      />
                    )}

                    {stage === "summary" && (
                      <SummaryCard
                        answers={answers}
                        submitting={submitting}
                        errorMessage={status === "error" ? errorMessage : ""}
                        missing={missing}
                        honeypot={honeypot}
                        onHoneypot={setHoneypot}
                        onEdit={goTo}
                        onSubmit={submit}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
