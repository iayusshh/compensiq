import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatLakhs, percentile } from "@/lib/utils";
import { TierBadge, Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, StatCard } from "@/components/ui/card";
import { CompanyLevelChart } from "@/components/compensation/company-level-chart";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCompanyData(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      compensations: {
        select: {
          id: true,
          role: true,
          level: true,
          levelOrder: true,
          location: true,
          currency: true,
          baseSalary: true,
          bonus: true,
          stockPerYear: true,
          totalComp: true,
          yearsExperience: true,
          submittedAt: true,
        },
        orderBy: { levelOrder: "asc" },
      },
      _count: { select: { compensations: true } },
    },
  });

  if (!company) return null;

  const levelMap = new Map<string, { tcs: number[]; bases: number[]; bonuses: number[]; stocks: number[]; order: number }>();
  for (const c of company.compensations) {
    if (!levelMap.has(c.level)) {
      levelMap.set(c.level, { tcs: [], bases: [], bonuses: [], stocks: [], order: c.levelOrder });
    }
    const g = levelMap.get(c.level)!;
    g.tcs.push(c.totalComp);
    g.bases.push(c.baseSalary);
    g.bonuses.push(c.bonus);
    g.stocks.push(c.stockPerYear);
  }

  const levelBreakdown = Array.from(levelMap.entries())
    .map(([level, g]) => ({
      level,
      levelOrder: g.order,
      count: g.tcs.length,
      medianBase: Math.round(percentile(g.bases, 50)),
      medianBonus: Math.round(percentile(g.bonuses, 50)),
      medianStock: Math.round(percentile(g.stocks, 50)),
      p25TC: Math.round(percentile(g.tcs, 25)),
      medianTC: Math.round(percentile(g.tcs, 50)),
      p75TC: Math.round(percentile(g.tcs, 75)),
    }))
    .sort((a, b) => a.levelOrder - b.levelOrder);

  const allTCs = company.compensations.map((c) => c.totalComp);
  const sorted = [...allTCs].sort((a, b) => a - b);

  return {
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      tier: company.tier,
      count: company._count.compensations,
      medianTC: Math.round(percentile(sorted, 50)),
      p25TC: Math.round(percentile(sorted, 25)),
      p75TC: Math.round(percentile(sorted, 75)),
      avgTC: sorted.length ? Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length) : 0,
    },
    levelBreakdown,
    recentEntries: company.compensations.slice(-8).reverse().map((e) => ({
      ...e,
      submittedAt: e.submittedAt.toISOString(),
    })),
  };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getCompanyData(slug);
  return {
    title: data ? `${data.company.name} Salaries — CompensIQ` : "Not Found",
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCompanyData(slug);
  if (!data) notFound();

  const { company, levelBreakdown, recentEntries } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <TierBadge tier={company.tier} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{company.count} salary entries</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Median TC" value={formatLakhs(company.medianTC)} sub="50th percentile" />
        <StatCard label="P25 TC" value={formatLakhs(company.p25TC)} sub="25th percentile" />
        <StatCard label="P75 TC" value={formatLakhs(company.p75TC)} sub="75th percentile" />
        <StatCard label="Average TC" value={formatLakhs(company.avgTC)} sub="Mean across all levels" />
      </div>

      {/* Level chart */}
      {levelBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">TC by Level</h2>
            <p className="text-xs text-gray-500">P25 / Median / P75 total compensation</p>
          </CardHeader>
          <CardContent>
            <CompanyLevelChart data={levelBreakdown} />
          </CardContent>
        </Card>
      )}

      {/* Level breakdown table */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Level Breakdown</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Level</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Base</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Bonus</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Equity/yr</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">P25 TC</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Median TC</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">P75 TC</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Count</th>
              </tr>
            </thead>
            <tbody>
              {levelBreakdown.map((row) => (
                <tr key={row.level} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Badge variant="muted">{row.level}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{formatLakhs(row.medianBase)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {row.medianBonus > 0 ? formatLakhs(row.medianBonus) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {row.medianStock > 0 ? formatLakhs(row.medianStock) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{formatLakhs(row.p25TC)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    {formatLakhs(row.medianTC)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{formatLakhs(row.p75TC)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent entries */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Recent Submissions</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 font-medium text-gray-600">Level</th>
                <th className="px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total TC</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">YoE</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{e.role}</td>
                  <td className="px-4 py-3"><Badge variant="muted">{e.level}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{e.location}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{formatLakhs(e.totalComp)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {e.yearsExperience != null ? `${e.yearsExperience}y` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
