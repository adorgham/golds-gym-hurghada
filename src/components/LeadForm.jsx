import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { track, EVENTS, whatsappUrl } from "@/lib/site";
import { Send, Loader2, Check } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function LeadForm({
  leadType = "contact",
  product,
  service,
  trainer,
  sourcePage,
  title = "Request Information",
  subtitle,
  ctaLabel = "Submit Request",
  variant = "default",
}) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", whatsapp: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await base44.entities.Lead.create({
        ...form,
        lead_type: leadType,
        product,
        service,
        trainer,
        source_page: sourcePage || window.location.pathname,
        status: "New",
      });
      track(EVENTS.leadSubmit, { lead_type: leadType, product, trainer, source: sourcePage });
      setDone(true);
    } catch (err) {
      setError("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="border border-gold/30 bg-white/[0.02] p-8 text-center animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-gold" />
        </div>
        <h3 className="font-heading text-2xl text-white mb-2">Request Received</h3>
        <p className="text-white/55 text-sm mb-5">Our team will reach out shortly. For an instant response, message us on WhatsApp.</p>
        <a href={whatsappUrl("Hi, I just submitted a request on your website.")} target="_blank" rel="noreferrer"
          onClick={() => track(EVENTS.whatsappClick, { location: "lead_form_success" })}
          className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading px-6 py-3 clip-tag">
          <WhatsAppIcon className="w-4 h-4" /> Open WhatsApp
        </a>
      </div>
    );
  }

  const fieldCls = "w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors";

  return (
    <form onSubmit={submit} className={variant === "compact" ? "space-y-3" : "space-y-4"}>
      {title && <h3 className="font-heading text-2xl text-white">{title}</h3>}
      {subtitle && <p className="text-white/55 text-sm">{subtitle}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" className={fieldCls} />
        <input type="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" className={fieldCls} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className={fieldCls} />
        <input type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="WhatsApp number" className={fieldCls} />
      </div>
      <textarea rows={variant === "compact" ? 2 : 3} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Message (optional)" className={fieldCls} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gold text-obsidian font-heading tracking-wide py-3.5 hover:brightness-110 disabled:opacity-60 transition-all clip-tag"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {ctaLabel}
      </button>
    </form>
  );
}