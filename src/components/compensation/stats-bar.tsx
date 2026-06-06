"use client";

import { AnimatedCount } from "@/components/ui/animated-number";
import { formatLakhs } from "@/lib/utils";

interface Props {
  totalEntries: number;
  totalCompanies: number;
  medianTC: number;
}

export function StatsBar({ totalEntries, totalCompanies, medianTC }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-3 divide-x divide-slate-200">
        <div className="px-8 py-6 text-center">
          <AnimatedCount
            to={totalEntries}
            className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl"
          />
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Salary entries
          </p>
        </div>
        <div className="px-8 py-6 text-center">
          <AnimatedCount
            to={totalCompanies}
            className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl"
          />
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Companies
          </p>
        </div>
        <div className="px-8 py-6 text-center">
          <p className="text-2xl font-bold tabular-nums text-emerald-700 sm:text-3xl">
            {formatLakhs(medianTC)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Median TC
          </p>
        </div>
      </div>
    </section>
  );
}
