import type { Answers, Lead, SubmitSuccess } from "./types";

const KEY = "pareto-talent:v1";

export type Stage = "contact" | "questions" | "summary" | "success";

export type PersistedState = {
  stage: Stage;
  index: number;
  answers: Answers;
  contact: Lead;
  submissionId: string;
  started: boolean;
  result: SubmitSuccess | null;
};

export function loadState(): PersistedState | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be blocked (private mode). The app still works, it just can't restore.
  }
}

export function clearState() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
