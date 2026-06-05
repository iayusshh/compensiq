"use client";

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

interface LevelData {
  level: string;
  p25TC: number;
  medianTC: number;
  p75TC: number;
  count: number;
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
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="mb-2 font-medium text-gray-700">Level: {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatLakhs(p.value)}
        </p>
      ))}
    </div>
  );
}

export function CompanyLevelChart({ data }: { data: LevelData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="level" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="p25TC" name="P25 TC" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        <Bar dataKey="medianTC" name="Median TC" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="p75TC" name="P75 TC" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
