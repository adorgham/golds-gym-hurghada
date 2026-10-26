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

function date(value: unknown): string {
  const result = text(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new SubmissionError("Choose a valid date");
  return result;
}

function time(value: unknown): string {
  const result = text(value, 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result)) throw new SubmissionError("Choose a valid time");
  return result;
}

export default async function (req: Request): Promise<Response> {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  try {
    const body = await req.json() as Record<string, unknown>;
    rejectSpam(body);

    const base44 = createClientFromRequest(req);
    const booking = await base44.asServiceRole.entities.Booking.create({
      trainer_id: text(body.trainer_id, MAX_LENGTHS.short),
      trainer_name: requiredText(body.trainer_name, "Trainer", MAX_LENGTHS.name),
      preferred_date: date(body.preferred_date),
      preferred_time: time(body.preferred_time),
      training_goal: text(body.training_goal, MAX_LENGTHS.message),
      is_member: body.is_member === true,
      name: requiredText(body.name, "Name", MAX_LENGTHS.name),
      phone: phone(body.phone),
      whatsapp: optionalPhone(body.whatsapp),
      email: email(body.email),
      source_page: text(body.source_page, MAX_LENGTHS.path),
      status: "New",
      ...attribution(body),
    });

    return Response.json({ success: true, id: booking.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SubmissionError) return jsonError(error.message);
    console.error("submit-pt-enquiry failed", error instanceof Error ? error.message : "Unknown error");
    return jsonError("Unable to submit your request right now", 500);
  }
}
