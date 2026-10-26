import { Link } from "react-router-dom";

export default function ContentState({
  title,
  message,
  actionTo = "/contact",
  actionLabel = "Contact the gym",
  compact = false,
}) {
  return (
    <div className={`border border-white/10 bg-white/[0.02] text-center ${compact ? "p-7" : "px-6 py-16"}`} role="status">
      <h2 className="font-heading text-2xl text-white">{title}</h2>
      {message && <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">{message}</p>}
      {actionTo && (
        <Link to={actionTo} className="mt-6 inline-flex bg-gold px-6 py-3 font-heading text-obsidian clip-tag">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
