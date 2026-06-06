"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted" | "faang" | "tier1" | "mid" | "startup";
  className?: string;
}

const variantClasses = {
  default: "bg-indigo-50 text-indigo-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  muted: "bg-slate-100 text-slate-600",
  faang: "bg-violet-50 text-violet-700",
  tier1: "bg-indigo-50 text-indigo-700",
  mid: "bg-slate-100 text-slate-600",
  startup: "bg-orange-50 text-orange-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    FAANG: { label: "FAANG", variant: "faang" },
    TIER1: { label: "Tier 1", variant: "tier1" },
    MID: { label: "Mid", variant: "mid" },
    STARTUP: { label: "Startup", variant: "startup" },
  };
  const { label, variant } = map[tier] ?? { label: tier, variant: "muted" };
  return <Badge variant={variant}>{label}</Badge>;
}
