import { base44 } from "@/api/base44Client";

export function track(eventName, properties = {}) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch (e) {
    // analytics not critical
  }
}

export const EVENTS = {
  membershipView: "membership_view",
  membershipSelect: "membership_select",
  passView: "pass_view",
  passSelect: "pass_select",
  trainerView: "trainer_view",
  trainerBookingStart: "trainer_booking_start",
  trainerBookingSubmit: "trainer_booking_submit",
  classView: "class_view",
  leadSubmit: "lead_submit",
  whatsappClick: "whatsapp_click",
  phoneClick: "phone_click",
  emailClick: "email_click",
  scheduleDateSelect: "schedule_date_select",
  scheduleFilterApply: "schedule_filter_apply",
  scheduleViewChange: "schedule_view_change",
  scheduleWeekNavigate: "schedule_week_navigate",
};

export const WHATSAPP_NUMBER = String(import.meta.env.VITE_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export const PHONE = String(import.meta.env.VITE_PUBLIC_PHONE || "").trim();
export const EMAIL = String(import.meta.env.VITE_PUBLIC_EMAIL || "").trim();
export const ADDRESS = String(import.meta.env.VITE_PUBLIC_ADDRESS || "").trim();
export const OPENING_HOURS = String(import.meta.env.VITE_PUBLIC_OPENING_HOURS || "").trim();
export const HAS_WHATSAPP = Boolean(WHATSAPP_NUMBER);

export function whatsappUrl(message) {
  if (!HAS_WHATSAPP) return "/contact";
  const text = encodeURIComponent(message || "Hi Gold's Gym Hurghada, I'd like to know more about memberships.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
