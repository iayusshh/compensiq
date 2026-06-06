import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white", className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-slate-100 px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <Card className={cn("px-6 py-5", className)}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}
