"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { CompareWidget } from "./compare-widget";
import { Check } from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  tier: string;
}

interface CompareData {
  companies: Array<{
    company: { id: string; name: string; slug: string; tier: string };
    totalCount: number;
    overallMedian: number;
    overallP25: number;
    overallP75: number;
    levels: Array<{
      level: string;
      levelOrder: number;
      count: number;
      p25: number;
      p50: number;
      p75: number;
      medianBase: number;
      medianBonus: number;
      medianStock: number;
    }>;
  }>;
  filters: { role: string | null; level: string | null };
}

export function CompareSelector({ companies }: { companies: Company[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [result, setResult] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 3
        ? [...prev, slug]
        : prev
    );
    setResult(null);
  }

  async function compare() {
    if (selected.length < 2) {
      setError("Select at least 2 companies");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selected.forEach((s) => params.append("company", s));
      if (role) params.set("role", role);
      if (level) params.set("level", level);

      const res = await fetch(`/api/compare?${params}`);
      if (res.ok) {
        setResult(await res.json());
      } else {
        const err = await res.json();
        setError(err.error ?? "Failed to fetch comparison");
      }
    } finally {
      setLoading(false);
    }
  }

  const TIER_ORDER: Record<string, number> = { FAANG: 0, TIER1: 1, MID: 2, STARTUP: 3 };
  const sorted = [...companies].sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9)
  );

  const tierLabels: Record<string, string> = {
    FAANG: "FAANG & Big Tech",
    TIER1: "Top Indian Tech",
    MID: "Mid-tier",
    STARTUP: "Startups",
  };

  const grouped = sorted.reduce((acc, c) => {
    if (!acc[c.tier]) acc[c.tier] = [];
    acc[c.tier].push(c);
    return acc;
  }, {} as Record<string, Company[]>);

  return (
    <div className="space-y-5">
      {/* Company picker */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Select companies
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Pick 2–3 companies to compare
              </p>
            </div>
            <span className="text-sm font-medium text-slate-400">
              {selected.length} / 3
            </span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          {Object.entries(grouped).map(([tier, comps]) => (
            <div key={tier}>
              <div className="mb-2.5 flex items-center gap-2">
                <TierBadge tier={tier} />
                <span className="text-xs font-medium text-slate-500">{tierLabels[tier] ?? tier}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {comps.map((c) => {
                  const isSelected = selected.includes(c.slug);
                  const disabled = !isSelected && selected.length >= 3;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => !disabled && toggle(c.slug)}
                      disabled={disabled}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : disabled
                          ? "cursor-not-allowed border-slate-100 text-slate-300"
                          : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Filters + action */}
        <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">Role filter</label>
            <input
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">Level filter</label>
            <input
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. L5, SDE2"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>
          <Button
            onClick={compare}
            loading={loading}
            disabled={selected.length < 2}
          >
            Compare
          </Button>
          {selected.length > 0 && (
            <button
              onClick={() => { setSelected([]); setResult(null); }}
              className="text-sm text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <p className="px-6 pb-4 text-sm text-red-600">{error}</p>
        )}
      </div>

      {result && <CompareWidget data={result} />}
    </div>
  );
}
