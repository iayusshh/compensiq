"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatLakhs } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const COMPANY_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

interface LevelData {
  level: string;
  levelOrder: number;
  count: number;
  p25: number;
  p50: number;
  p75: number;
  medianBase: number;
  medianBonus: number;
  medianStock: number;
}

interface CompanyResult {
  company: { id: string; name: string; slug: string; tier: string };
  totalCount: number;
  overallMedian: number;
  overallP25: number;
  overallP75: number;
  levels: LevelData[];
}

interface CompareData {
  companies: CompanyResult[];
  filters: { role: string | null; level: string | null };
}

function formatYAxis(val: number): string {
  if (val >= 10_000_000) return `${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `${(val / 100_000).toFixed(0)}L`;
  return `${val}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-500">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {formatLakhs(p.value)}
        </p>
      ))}
    </div>
  );
}

const VIEWS = ["overview", "levels", "breakdown"] as const;
type View = (typeof VIEWS)[number];

export function CompareWidget({ data }: { data: CompareData }) {
  const [view, setView] = useState<View>("overview");

  const allLevels = [
    ...new Set(data.companies.flatMap((c) => c.levels.map((l) => l.level))),
  ];

  const levelChartData = allLevels.map((level) => {
    const row: Record<string, string | number> = { level };
    for (const comp of data.companies) {
      const lv = comp.levels.find((l) => l.level === level);
      row[comp.company.name] = lv?.p50 ?? 0;
    }
    return row;
  });

  const overviewData = data.companies.map((c) => ({
    company: c.company.name,
    "P25 TC": c.overallP25,
    "Median TC": c.overallMedian,
    "P75 TC": c.overallP75,
  }));

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.companies.map((comp, i) => (
          <div
            key={comp.company.id}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4"
            style={{ borderTopColor: COMPANY_COLORS[i], borderTopWidth: 3 }}
          >
            <h3 className="font-semibold text-slate-900">{comp.company.name}</h3>
            <p className="mt-3 text-2xl font-bold tabular-nums" style={{ color: COMPANY_COLORS[i] }}>
              {formatLakhs(comp.overallMedian)}
            </p>
            <p className="text-xs text-slate-400">Median TC</p>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>P25: {formatLakhs(comp.overallP25)}</span>
              <span>P75: {formatLakhs(comp.overallP75)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{comp.totalCount} data points</p>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              view === v
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <Card>
          <CardHeader>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Overall TC Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="company" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="P25 TC" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Median TC" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="P75 TC" fill="#4338ca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {view === "levels" && (
        <Card>
          <CardHeader>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Median TC by Level</h3>
          </CardHeader>
          <CardContent>
            {levelChartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No level data to compare</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={levelChartData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {data.companies.map((comp, i) => (
                    <Bar
                      key={comp.company.id}
                      dataKey={comp.company.name}
                      fill={COMPANY_COLORS[i]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {view === "breakdown" && (
        <Card>
          <CardHeader>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Compensation Breakdown
            </h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Level</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Base</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Bonus</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Equity</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Median TC</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">n</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.companies.flatMap((comp, ci) =>
                  comp.levels.map((lv, li) => (
                    <tr key={`${comp.company.id}-${lv.level}`} className="hover:bg-slate-50/60">
                      {li === 0 && (
                        <td
                          className="px-5 py-3 text-sm font-semibold"
                          style={{ color: COMPANY_COLORS[ci] }}
                          rowSpan={comp.levels.length}
                        >
                          {comp.company.name}
                        </td>
                      )}
                      <td className="px-5 py-3 text-slate-600">{lv.level}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{formatLakhs(lv.medianBase)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-400">
                        {lv.medianBonus > 0 ? formatLakhs(lv.medianBonus) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-400">
                        {lv.medianStock > 0 ? formatLakhs(lv.medianStock) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-emerald-700">
                        {formatLakhs(lv.p50)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400">{lv.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
