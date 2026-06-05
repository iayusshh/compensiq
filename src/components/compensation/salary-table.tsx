"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatLakhs } from "@/lib/utils";
import { TierBadge, Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CompensationEntry, PaginatedResponse } from "@/types";

const ROLES = ["Software Engineer", "Product Manager", "Data Scientist", "Designer", "DevOps Engineer", "Engineering Manager"];
const LEVELS = ["L3", "L4", "L5", "L6", "L7", "SDE1", "SDE2", "SDE3", "Senior SDE", "Principal SDE", "Junior", "Mid", "Senior", "Staff"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Gurgaon", "Chennai", "Noida", "Remote"];
const SORT_OPTIONS = [
  { value: "totalComp:desc", label: "Highest TC" },
  { value: "totalComp:asc", label: "Lowest TC" },
  { value: "submittedAt:desc", label: "Most Recent" },
  { value: "levelOrder:asc", label: "Level (Low → High)" },
  { value: "levelOrder:desc", label: "Level (High → Low)" },
];

interface Filters {
  company: string;
  role: string;
  level: string;
  location: string;
  sort: string;
}

interface SalaryTableProps {
  initialData: PaginatedResponse<CompensationEntry>;
}

export function SalaryTable({ initialData }: SalaryTableProps) {
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
      const params = new URLSearchParams({
        page: p.toString(),
        limit: "20",
        sortBy,
        sortDir,
      });
      if (f.company) params.set("company", f.company);
      if (f.role) params.set("role", f.role);
      if (f.level) params.set("level", f.level);
      if (f.location) params.set("location", f.location);

      const res = await fetch(`/api/compensations?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
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
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {data.total.toLocaleString()} entries found
        </p>
        {(filters.company || filters.role || filters.level || filters.location) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const reset = { company: "", role: "", level: "", location: "", sort: "totalComp:desc" };
              setFilters(reset);
              setPage(1);
              fetchData(reset, 1);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="px-4 py-3 font-medium text-gray-600">Level</th>
              <th className="px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Base</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Bonus</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Equity/yr</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Total TC</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {data.data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  No data found. Try adjusting your filters.
                </td>
              </tr>
            )}
            {data.data.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-gray-50 transition-colors hover:bg-blue-50/30 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/companies/${row.company.slug}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {row.company.name}
                  </Link>
                  <div className="mt-0.5">
                    <TierBadge tier={row.company.tier} />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{row.role}</td>
                <td className="px-4 py-3">
                  <Badge variant="muted">{row.level}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{row.location}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatLakhs(row.baseSalary)}</td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {row.bonus > 0 ? formatLakhs(row.bonus) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {row.stockPerYear > 0 ? formatLakhs(row.stockPerYear) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  {formatLakhs(row.totalComp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => handlePage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.totalPages}
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
