/**
 * Single source of truth for the assessment: copy, options and chat reactions.
 * Option strings are also what gets sent to GoHighLevel, so keep them identical to
 * the dropdown/option values you create in GHL custom fields.
 */

export const ROLE = {
  FOUNDER: "Founder / CEO",
  COFOUNDER: "Co-Founder",
  OWNER: "Business Owner",
  EXECUTIVE: "Executive",
  CONSULTANT: "Consultant",
  OTHER: "Other",
} as const;

export const STAGE = {
  IDEA: "Idea / Pre-launch",
  EARLY: "Early-stage",
  GROWING: "Growing",
  ESTABLISHED: "Established",
  SCALING: "Scaling",
} as const;

export const CHALLENGE = {
  FOCUS: "I don't know where to focus",
  TOO_MANY: "I'm doing too many things myself",
  TEAM: "My team needs better direction",
  SLOWED: "Growth has slowed down",
  ADVANTAGE: "I struggle to identify my strongest advantage",
  SYSTEMS: "I need better systems",
  OTHER: "Other",
} as const;

export const IMPROVE = {
  PRODUCTIVITY: "My productivity",
  LEADERSHIP: "My leadership",
  TEAM: "My team's performance",
  GROWTH: "My growth",
  DECISIONS: "My decision-making",
  FOCUS: "My ability to focus on what I do best",
  SYSTEMS: "My business systems",
} as const;

export const STATEMENT = {
  LOW_VALUE: "I spend too much time on things that don't create enough value.",
  MANY_STRENGTHS: "I have many strengths but I'm not sure where they create the most impact.",
  LEVERAGE: "I know what I'm good at but struggle to leverage it consistently.",
  DELEGATE: "I need to delegate more effectively.",
  BUILD: "I want to build a business around my highest-value contribution.",
} as const;

export const INTEREST = {
  CURIOUS: "Just curious",
  SOMEWHAT: "Somewhat interested",
  VERY: "Very interested",
  HELP: "I want help applying it to my business",
} as const;

export const EXPLORE = {
  YES: "Yes, I'd like to explore it",
  NO: "Not right now",
} as const;

export type AnswerKey =
  | "role"
  | "business_stage"
  | "biggest_challenge"
  | "improvement_priority"
  | "founder_statement"
  | "talent_interest"
  | "desired_outcome"
  | "explore_application";

export type Question = {
  id: AnswerKey;
  /** Short name used in the step list and the summary. */
  step: string;
  prompt: string;
  kind: "choice" | "text";
  options?: readonly string[];
  columns?: 1 | 2;
  required: boolean;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  /** Assistant reply shown after the answer. */
  reaction: string;
  skippedReaction?: string;
};

export const INTRO_MESSAGE =
  "Hi! I'm your Pareto Talent Guide. I'll ask you a few questions to understand your current business situation and help identify where your highest-value contribution could create the most leverage.";

export const QUESTIONS: readonly Question[] = [
  {
    id: "role",
    step: "Role",
    prompt: "What best describes your role?",
    kind: "choice",
    options: Object.values(ROLE),
    columns: 2,
    required: true,
    reaction: "Great. That gives me some context.",
  },
  {
    id: "business_stage",
    step: "Business stage",
    prompt: "What stage is your business currently in?",
    kind: "choice",
    options: Object.values(STAGE),
    columns: 2,
    required: true,
    reaction: "That helps me understand where you are in the journey.",
  },
  {
    id: "biggest_challenge",
    step: "Biggest challenge",
    prompt: "What is your biggest challenge right now?",
    kind: "choice",
    options: Object.values(CHALLENGE),
    columns: 1,
    required: true,
    reaction:
      "That's an important one. Let's look at where your highest-value contribution could create leverage.",
  },
  {
    id: "improvement_priority",
    step: "Top priority",
    prompt: "What would you most like to improve in your business?",
    kind: "choice",
    options: Object.values(IMPROVE),
    columns: 1,
    required: true,
    hint: "Choose the one that matters most.",
    reaction: "Good to know. That will shape what we point you to.",
  },
  {
    id: "founder_statement",
    step: "Best description",
    prompt: "Which statement describes you best?",
    kind: "choice",
    options: Object.values(STATEMENT),
    columns: 1,
    required: true,
    reaction: "Understood. That tells me a lot about how you work.",
  },
  {
    id: "talent_interest",
    step: "Interest level",
    prompt: "How interested are you in discovering your highest-value talent?",
    kind: "choice",
    options: Object.values(INTEREST),
    columns: 1,
    required: true,
    reaction: "Thanks for being straightforward about that.",
  },
  {
    id: "desired_outcome",
    step: "Desired outcome",
    prompt: "What would discovering your highest-value talent help you accomplish?",
    kind: "text",
    required: false,
    hint: "Optional. A sentence or two is plenty.",
    placeholder: "Tell us what you would most like to change, improve, or unlock...",
    maxLength: 1000,
    reaction: "Thank you for sharing that.",
    skippedReaction: "No problem. We can leave that one.",
  },
  {
    id: "explore_application",
    step: "Next step",
    prompt: "Would you like to explore how to apply your Pareto Talent to your business?",
    kind: "choice",
    options: Object.values(EXPLORE),
    columns: 1,
    required: true,
    reaction: "Thank you. I have enough information to prepare your Pareto Talent Guide.",
  },
];

export const QUESTION_COUNT = QUESTIONS.length;
