import Reveal from "@/components/Reveal";

export default function SectionHeading({ eyebrow, title, accent, subtitle, align = "left", light = false }) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${align === "center" ? "justify-center" : ""}`}>
          <span className="h-px w-10 bg-gold" />
          <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">{eyebrow}</span>
          {align === "center" && <span className="h-px w-10 bg-gold" />}
        </div>
      )}
      <h2 className={`font-heading text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight ${light ? "text-white" : "text-white"}`}>
        {title} {accent && <span className="gold-text">{accent}</span>}
      </h2>
      {subtitle && <p className={`mt-5 text-white/55 text-base sm:text-lg max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p>}
    </Reveal>
  );
}