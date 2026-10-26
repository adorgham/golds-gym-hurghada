import { createClientFromRequest } from "npm:@base44/sdk@0.8.51";
import {
  MAX_LENGTHS,
  SubmissionError,
  attribution,
  email,
  jsonError,
  optionalPhone,
  phone,
  rejectSpam,
  requiredText,
  text,
} from "../../shared/public-submissions.ts";

const LEAD_TYPES = new Set(["membership", "pass", "contact", "tour", "callback"]);

export default async function (req: Request): Promise<Response> {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  try {
    const body = await req.json() as Record<string, unknown>;
    rejectSpam(body);

    const leadType = text(body.lead_type, 40);
    if (!LEAD_TYPES.has(leadType)) throw new SubmissionError("Invalid request type");

    const base44 = createClientFromRequest(req);
    const lead = await base44.asServiceRole.entities.Lead.create({
      name: requiredText(body.name, "Name", MAX_LENGTHS.name),
      phone: phone(body.phone),
      email: email(body.email),
      whatsapp: optionalPhone(body.whatsapp),
      product: text(body.product, MAX_LENGTHS.short),
      service: text(body.service, MAX_LENGTHS.short),
      trainer: text(body.trainer, MAX_LENGTHS.short),
      message: text(body.message, MAX_LENGTHS.message),
      source_page: text(body.source_page, MAX_LENGTHS.path),
      lead_type: leadType,
      status: "New",
      ...attribution(body),
    });

    return Response.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SubmissionError) return jsonError(error.message);
    console.error("submit-lead failed", error instanceof Error ? error.message : "Unknown error");
    return jsonError("Unable to submit your request right now", 500);
  }
}
