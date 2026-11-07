import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[14px] border border-border bg-card p-3.5 ${className}`}>{children}</div>;
}

export function Label({ children, className = "", color }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <span className={`label ${className}`} style={color ? { color } : undefined}>
      {children}
    </span>
  );
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card p-3">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="truncate font-mono text-xl font-bold text-accent">{value}</span>
    </div>
  );
}

export type ChipTone = "success" | "accent" | "muted" | "warn" | "error";
const TONES: Record<ChipTone, string> = {
  success: "text-success border-[#2F6B44]",
  accent: "text-accent border-accent-line",
  muted: "text-muted border-border",
  warn: "text-warn border-[#6B4A12]",
  error: "text-error border-[#7F1D1D]",
};

export function Chip({ children, tone = "muted", small = false }: { children: ReactNode; tone?: ChipTone; small?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-md border font-mono ${small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"} ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "dashed";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
};

const VARIANTS = {
  primary: "bg-accent text-on-accent font-semibold border border-accent",
  secondary: "bg-card text-text font-semibold border border-border",
  ghost: "bg-transparent text-muted border border-transparent",
  dashed: "bg-transparent text-accent font-semibold border border-dashed border-accent-line",
};

export function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button", ariaLabel }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex min-h-12 items-center justify-center rounded-[10px] px-4 text-sm ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: keyof typeof VARIANTS; className?: string }) {
  return (
    <Link href={href} className={`flex min-h-12 items-center justify-center rounded-[10px] px-4 text-sm ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function BackLink({ href = "/", label = "Home" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="flex min-h-11 items-center text-sm text-muted">
      ← {label}
    </Link>
  );
}

export function Bar({ pct, color = "var(--color-warn)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-sm bg-divider">
      <div className="h-1.5 rounded-sm" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

/** Renders **bold** markup. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <b key={i} className="font-semibold text-text">
            {p.slice(2, -2)}
          </b>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function Loading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted" role="status">
      <span className="loading-dot h-2 w-2 rounded-full bg-accent" />
      {text}
    </div>
  );
}
