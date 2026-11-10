import { Link } from "react-router-dom";

export default function Wordmark({
  className = "",
  to = "/",
  size = "default",
}) {
  const sizes = {
    default: "text-2xl",
    sm: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2.5 text-charcoal transition-opacity hover:opacity-75 ${className}`}
      aria-label="Chronicle home"
    >
      <span className={`font-serif tracking-tight ${sizes[size]}`}>
        Chronicle<span className="text-sage">.</span>
      </span>
    </Link>
  );
}
