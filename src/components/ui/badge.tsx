"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted" | "faang" | "tier1" | "mid" | "startup";
  className?: string;
}

const variantClasses = {
  default: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  muted: "bg-gray-100 text-gray-600",
  faang: "bg-purple-100 text-purple-800",
  tier1: "bg-blue-100 text-blue-800",
  mid: "bg-gray-100 text-gray-700",
  startup: "bg-orange-100 text-orange-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
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
