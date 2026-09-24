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
};

export const WHATSAPP_NUMBER = "201000000000";
export const PHONE = "+20 65 000 0000";
export const EMAIL = "hello@goldsgymhurghada.com";
export const ADDRESS = "Hurghada Marina, Red Sea, Egypt";

export function whatsappUrl(message) {
  const text = encodeURIComponent(message || "Hi Gold's Gym Hurghada, I'd like to know more about memberships.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}