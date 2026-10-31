import { Link } from "react-router-dom";

export default function Wordmark({
  className = "",
  to = "/",
  size = "default",
  mark = false,
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
      {mark && (
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-sage-deep text-ivory shadow-sm transition-transform duration-500 group-hover:-rotate-3">
          <span className="font-serif text-lg leading-none">C</span>
        </span>
      )}
      <span className={`font-serif tracking-tight ${sizes[size]}`}>
        Chronicle
        <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-sage align-middle" />
      </span>
    </Link>
  );
}
