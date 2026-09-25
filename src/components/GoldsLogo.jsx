/**
 * Gold's Gym brand logo — circular badge with bodybuilder silhouette.
 * Variants: "full" (badge + wordmark), "badge" (circle only), "mark" (silhouette only).
 */
export default function GoldsLogo({ variant = "badge", size = 40, className = "" }) {
  if (variant === "mark") {
    return <Silhouette size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Badge size={size} />
      {variant === "full" && (
        <div className="leading-none">
          <div className="font-serif text-[#FFED00] text-lg tracking-tight" style={{ fontSize: size * 0.42 }}>
            GOLD'S GYM
          </div>
          <div className="text-[9px] tracking-[0.35em] text-white/60 font-semibold">HURGHADA</div>
        </div>
      )}
    </div>
  );
}

function Badge({ size = 40 }) {
  return (
    <div
      className="relative rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: "#FFED00",
        border: `${Math.max(2, size * 0.08)}px solid #0A0A0A`,
        boxShadow: "0 0 0 1px #FFED00",
      }}
    >
      <Silhouette size={size * 0.62} color="#0A0A0A" />
    </div>
  );
}

function Silhouette({ size = 24, color = "#FFED00", className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill={color}
      aria-hidden="true"
    >
      {/* Barbell bar */}
      <rect x="6" y="30" width="52" height="3" rx="1" />
      {/* Left plates */}
      <rect x="2" y="22" width="6" height="19" rx="1.5" />
      <rect x="9" y="25" width="4" height="13" rx="1" />
      {/* Right plates */}
      <rect x="56" y="22" width="6" height="19" rx="1.5" />
      <rect x="51" y="25" width="4" height="13" rx="1" />
      {/* Head */}
      <circle cx="32" cy="14" r="5.5" />
      {/* Torso — wide shoulders tapering to waist */}
      <path d="M32 20
               C 24 20, 20 24, 19 30
               L 18 34
               C 17 36, 17 38, 19 39
               L 22 40
               L 22 48
               L 27 48
               L 27 42
               L 37 42
               L 37 48
               L 42 48
               L 42 40
               L 45 39
               C 47 38, 47 36, 46 34
               L 45 30
               C 44 24, 40 20, 32 20 Z" />
      {/* Left arm raised to barbell */}
      <path d="M20 25
               C 16 26, 13 28, 11 31
               L 9 33
               L 11 35
               L 14 32
               C 16 30, 18 29, 20 29 Z" />
      {/* Right arm raised to barbell */}
      <path d="M44 25
               C 48 26, 51 28, 53 31
               L 55 33
               L 53 35
               L 50 32
               C 48 30, 46 29, 44 29 Z" />
      {/* Left leg */}
      <path d="M27 48
               L 25 58
               L 23 62
               L 28 62
               L 29 56
               L 30 62
               L 32 62
               L 32 48 Z" />
      {/* Right leg */}
      <path d="M37 48
               L 39 58
               L 41 62
               L 36 62
               L 35 56
               L 34 62
               L 32 62
               L 32 48 Z" />
    </svg>
  );
}