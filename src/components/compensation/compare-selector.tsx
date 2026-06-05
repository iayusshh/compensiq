"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CompareWidget } from "./compare-widget";

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
    <div className="space-y-6">
      {/* Company picker */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-gray-700">
          Select 2–3 companies to compare
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          {selected.length}/3 selected
        </p>

        {Object.entries(grouped).map(([tier, comps]) => (
          <div key={tier} className="mb-4">
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              {tierLabels[tier] ?? tier}
            </p>
            <div className="flex flex-wrap gap-2">
              {comps.map((c) => {
                const isSelected = selected.includes(c.slug);
                const disabled = !isSelected && selected.length >= 3;
                return (
                  <button
                    key={c.slug}
                    onClick={() => !disabled && toggle(c.slug)}
                    disabled={disabled}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : disabled
                        ? "border-gray-100 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {c.name}
                    {isSelected && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Optional filters */}
        <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
          <input
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Filter by role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Filter by level (optional)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          <Button onClick={compare} loading={loading} disabled={selected.length < 2}>
            Compare
          </Button>
          {selected.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => { setSelected([]); setResult(null); }}
            >
              Clear
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* Results */}
      {result && <CompareWidget data={result} />}
    </div>
  );
}
