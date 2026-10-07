/** Display-only: swaps straight apostrophes for typographic ones. Data sent to GHL is not changed. */
export const smart = (text: string) => text.replace(/'/g, "\u2019");
