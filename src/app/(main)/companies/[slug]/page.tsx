import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatLakhs, percentile } from "@/lib/utils";
import { TierBadge, Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  const levelMap = new Map<
    string,
    { tcs: number[]; bases: number[]; bonuses: number[]; stocks: number[]; order: number }
  >();
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
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{company.name}</h1>
          <TierBadge tier={company.tier} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{company.count} salary entries</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Median TC", value: formatLakhs(company.medianTC), sub: "50th percentile" },
          { label: "P25 TC", value: formatLakhs(company.p25TC), sub: "25th percentile" },
          { label: "P75 TC", value: formatLakhs(company.p75TC), sub: "75th percentile" },
          { label: "Average TC", value: formatLakhs(company.avgTC), sub: "Mean across levels" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {levelBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">TC by Level</h2>
            <p className="mt-0.5 text-xs text-slate-400">P25 / Median / P75 total compensation</p>
          </CardHeader>
          <CardContent>
            <CompanyLevelChart data={levelBreakdown} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Level Breakdown</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                {["Level", "Base", "Bonus", "Equity/yr", "P25 TC", "Median TC", "P75 TC", "Count"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${i > 0 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {levelBreakdown.map((row) => (
                <tr key={row.level} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Badge variant="muted">{row.level}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{formatLakhs(row.medianBase)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">
                    {row.medianBonus > 0 ? formatLakhs(row.medianBonus) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">
                    {row.medianStock > 0 ? formatLakhs(row.medianStock) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">{formatLakhs(row.p25TC)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-emerald-700">
                    {formatLakhs(row.medianTC)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">{formatLakhs(row.p75TC)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Recent Submissions</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                {["Role", "Level", "Location", "Total TC", "YoE"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${i >= 3 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 text-slate-700">{e.role}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="muted">{e.level}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{e.location}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-emerald-700">
                    {formatLakhs(e.totalComp)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-400">
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
