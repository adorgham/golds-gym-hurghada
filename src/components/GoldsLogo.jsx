const LOGO_SRC = "/golds-gym-logo.webp";

/** Official Gold's Gym Hurghada logo. */
export default function GoldsLogo({ size = 40, className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Gold's Gym Hurghada"
      className={`shrink-0 object-contain ${className}`}
      style={{ height: size, width: size * (500 / 281) }}
    />
  );
}
