export const MAX_LENGTHS = {
  name: 120,
  email: 254,
  phone: 40,
  whatsapp: 40,
  short: 160,
  message: 2000,
  path: 500,
};

export function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function requiredText(value: unknown, field: string, maxLength: number): string {
  const result = text(value, maxLength);
  if (!result) throw new SubmissionError(`${field} is required`);
  return result;
}

export function email(value: unknown): string {
  const result = text(value, MAX_LENGTHS.email).toLowerCase();
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) {
    throw new SubmissionError("Enter a valid email address");
  }
  return result;
}

export function phone(value: unknown, field = "Phone"): string {
  const result = requiredText(value, field, MAX_LENGTHS.phone);
  if (!/^[+()\d\s.-]{7,40}$/.test(result)) {
    throw new SubmissionError(`Enter a valid ${field.toLowerCase()} number`);
  }
  return result;
}

export function optionalPhone(value: unknown): string {
  const result = text(value, MAX_LENGTHS.phone);
  if (result && !/^[+()\d\s.-]{7,40}$/.test(result)) {
    throw new SubmissionError("Enter a valid WhatsApp number");
  }
  return result;
}

export function attribution(body: Record<string, unknown>) {
  return {
    utm_source: text(body.utm_source, MAX_LENGTHS.short),
    utm_medium: text(body.utm_medium, MAX_LENGTHS.short),
    utm_campaign: text(body.utm_campaign, MAX_LENGTHS.short),
    utm_term: text(body.utm_term, MAX_LENGTHS.short),
    utm_content: text(body.utm_content, MAX_LENGTHS.short),
    landing_page: text(body.landing_page, MAX_LENGTHS.path),
    referrer: text(body.referrer, MAX_LENGTHS.path),
  };
}

export function rejectSpam(body: Record<string, unknown>) {
  if (text(body.website, 200)) throw new SubmissionError("Invalid submission");

  const startedAt = Number(body.form_started_at);
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < 1200 || elapsed > 7_200_000) {
    throw new SubmissionError("Please refresh the page and try again");
  }
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}

export class SubmissionError extends Error {}
