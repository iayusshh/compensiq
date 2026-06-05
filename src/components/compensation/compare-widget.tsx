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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const COMPANY_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

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

interface CompareWidgetProps {
  data: CompareData;
}

function formatYAxis(val: number): string {
  if (val >= 10_000_000) return `${(val / 10_000_000).toFixed(1)}Cr`;
  if (val >= 100_000) return `${(val / 100_000).toFixed(0)}L`;
  return `${val}`;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {formatLakhs(p.value)}
        </p>
      ))}
    </div>
  );
}

export function CompareWidget({ data }: CompareWidgetProps) {
  const [view, setView] = useState<"overview" | "levels" | "breakdown">("overview");

  // Build chart data for median TC comparison
  const allLevels = [
    ...new Set(
      data.companies.flatMap((c) => c.levels.map((l) => l.level))
    ),
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
          <Card key={comp.company.id} className="border-t-4" style={{ borderTopColor: COMPANY_COLORS[i] }}>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-900">{comp.company.name}</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatLakhs(comp.overallMedian)}</p>
              <p className="text-xs text-gray-500">Median TC</p>
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>P25: {formatLakhs(comp.overallP25)}</span>
                <span>P75: {formatLakhs(comp.overallP75)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{comp.totalCount} data points</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {(["overview", "levels", "breakdown"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              view === v
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Overview chart: P25/Median/P75 by company */}
      {view === "overview" && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-700">Overall TC Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="company" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="P25 TC" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Median TC" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="P75 TC" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Level comparison chart */}
      {view === "levels" && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-700">Median TC by Level</h3>
          </CardHeader>
          <CardContent>
            {levelChartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No level data to compare</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={levelChartData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
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

      {/* Breakdown table */}
      {view === "breakdown" && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-700">Compensation Breakdown by Company</h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Company</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Level</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Base</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Bonus</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Equity</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Median TC</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.companies.flatMap((comp, ci) =>
                  comp.levels.map((lv, li) => (
                    <tr key={`${comp.company.id}-${lv.level}`} className="border-b border-gray-50 hover:bg-gray-50">
                      {li === 0 && (
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: COMPANY_COLORS[ci] }}
                          rowSpan={comp.levels.length}
                        >
                          {comp.company.name}
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-600">{lv.level}</td>
                      <td className="px-4 py-3 text-right">{formatLakhs(lv.medianBase)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{lv.medianBonus > 0 ? formatLakhs(lv.medianBonus) : "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{lv.medianStock > 0 ? formatLakhs(lv.medianStock) : "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{formatLakhs(lv.p50)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{lv.count}</td>
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
