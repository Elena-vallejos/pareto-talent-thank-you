import type { Lead } from "./types";

export const EMPTY_LEAD: Lead = { first_name: "", email: "", company: "", role: "" };

const pick = (params: URLSearchParams, names: string[]) => {
  for (const n of names) {
    const v = params.get(n);
    if (v && v.trim()) return v.trim();
  }
  return "";
};

/**
 * Reads the first-form data from the URL. Configure the GHL form's redirect to:
 * https://YOUR-DOMAIN/?first_name={{contact.first_name}}&email={{contact.email}}&company={{contact.company_name}}&role={{contact.role}}
 */
export function readLeadFromLocation(): Lead {
  const params = new URLSearchParams(window.location.search);
  return {
    first_name: pick(params, ["first_name", "firstName", "firstname", "name"]).slice(0, 100),
    email: pick(params, ["email", "Email"]).slice(0, 254),
    company: pick(params, ["company", "company_name", "companyName"]).slice(0, 200),
    role: pick(params, ["role", "title"]).slice(0, 100),
  };
}
