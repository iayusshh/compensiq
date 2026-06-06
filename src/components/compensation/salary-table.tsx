"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatLakhs } from "@/lib/utils";
import { TierBadge, Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CompensationEntry, PaginatedResponse } from "@/types";

const ROLES = [
  "Software Engineer", "Product Manager", "Data Scientist",
  "Designer", "DevOps Engineer", "Engineering Manager",
];
const LEVELS = [
  "L3", "L4", "L5", "L6", "L7", "SDE1", "SDE2", "SDE3",
  "Senior SDE", "Principal SDE", "Junior", "Mid", "Senior", "Staff",
];
const LOCATIONS = [
  "Bangalore", "Hyderabad", "Pune", "Mumbai", "Gurgaon",
  "Chennai", "Noida", "Remote",
];
const SORT_OPTIONS = [
  { value: "totalComp:desc", label: "Highest TC" },
  { value: "totalComp:asc", label: "Lowest TC" },
  { value: "submittedAt:desc", label: "Most Recent" },
  { value: "levelOrder:asc", label: "Level Low → High" },
  { value: "levelOrder:desc", label: "Level High → Low" },
];

interface Filters {
  company: string;
  role: string;
  level: string;
  location: string;
  sort: string;
}

export function SalaryTable({ initialData }: { initialData: PaginatedResponse<CompensationEntry> }) {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<Filters>({
    company: "",
    role: "",
    level: "",
    location: "",
    sort: "totalComp:desc",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    try {
      const [sortBy, sortDir] = f.sort.split(":");
      const params = new URLSearchParams({ page: p.toString(), limit: "20", sortBy, sortDir });
      if (f.company) params.set("company", f.company);
      if (f.role) params.set("role", f.role);
      if (f.level) params.set("level", f.level);
      if (f.location) params.set("location", f.location);

      const res = await fetch(`/api/compensations?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    fetchData(newFilters, 1);
  };

  const handlePage = (p: number) => {
    setPage(p);
    fetchData(filters, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = !!(filters.company || filters.role || filters.level || filters.location);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Input
            placeholder="Company..."
            value={filters.company}
            onChange={(e) => handleFilterChange("company", e.target.value)}
          />
          <Select
            value={filters.role}
            onChange={(v) => handleFilterChange("role", v)}
            options={ROLES.map((r) => ({ value: r, label: r }))}
            placeholder="All Roles"
          />
          <Select
            value={filters.level}
            onChange={(v) => handleFilterChange("level", v)}
            options={LEVELS.map((l) => ({ value: l, label: l }))}
            placeholder="All Levels"
          />
          <Select
            value={filters.location}
            onChange={(v) => handleFilterChange("location", v)}
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
            placeholder="All Locations"
          />
          <Select
            value={filters.sort}
            onChange={(v) => handleFilterChange("sort", v)}
            options={SORT_OPTIONS}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-0.5">
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-900">{data.total.toLocaleString()}</span> entries
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => {
              const reset: Filters = { company: "", role: "", level: "", location: "", sort: "totalComp:desc" };
              setFilters(reset);
              setPage(1);
              fetchData(reset, 1);
            }}
            className="text-sm text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white transition-opacity ${loading ? "opacity-60" : ""}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Level</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Base</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Bonus</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Equity/yr</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total TC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                  No results. Try adjusting your filters.
                </td>
              </tr>
            )}
            {data.data.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/companies/${row.company.slug}`}
                    className="font-medium text-slate-900 hover:text-indigo-700"
                  >
                    {row.company.name}
                  </Link>
                  <div className="mt-0.5">
                    <TierBadge tier={row.company.tier} />
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{row.role}</td>
                <td className="px-5 py-3.5">
                  <Badge variant="muted">{row.level}</Badge>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{row.location}</td>
                <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                  {formatLakhs(row.baseSalary)}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">
                  {row.bonus > 0 ? formatLakhs(row.bonus) : "—"}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">
                  {row.stockPerYear > 0 ? formatLakhs(row.stockPerYear) : "—"}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="font-semibold tabular-nums text-emerald-700">
                    {formatLakhs(row.totalComp)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => handlePage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-900">{page}</span> of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => handlePage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
