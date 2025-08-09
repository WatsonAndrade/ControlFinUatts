import React from "react";

type Variant = "success" | "danger" | "info" | "neutral";

const variantClasses: Record<Variant, string> = {
  success: "bg-emerald-700/40 ring-emerald-500/40",
  danger:  "bg-rose-700/40 ring-rose-500/40",
  info:    "bg-indigo-700/40 ring-indigo-500/40",
  neutral: "bg-zinc-800/60 ring-zinc-500/30",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  selected?: boolean;
  onSelect?: () => void;
  title?: string;
  value?: string;
  subtitle?: string;
}

export default function Card({
  variant = "neutral",
  selected = false,
  onSelect,
  title,
  value,
  subtitle,
  className = "",
  ...rest
}: CardProps) {
  const base =
    "rounded-xl p-4 md:p-5 shadow-lg ring-1 transition-all " +
    "hover:translate-y-[-1px] hover:shadow-xl focus:outline-none " +
    "focus-visible:ring-2";

  const hoverFx =
    "hover:ring-2 hover:brightness-110 hover:saturate-125 " +
    "active:scale-[0.99]";

  const selectedFx = selected ? "ring-2 scale-[0.999]" : "";

  const clickable = onSelect ? "cursor-pointer" : "";

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={[
        base,
        hoverFx,
        selectedFx,
        clickable,
        variantClasses[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {value && <p className="mt-2 text-2xl md:text-3xl font-bold">{value}</p>}
      {subtitle && (
        <p className="mt-1 text-sm text-zinc-300/80">{subtitle}</p>
      )}
    </div>
  );
}
