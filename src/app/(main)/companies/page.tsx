import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatLakhs, percentile } from "@/lib/utils";
import { TierBadge } from "@/components/ui/badge";

export const metadata = {
  title: "Companies — CompensIQ",
};

async function getCompanies() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { compensations: { _count: "desc" } },
      include: {
        _count: { select: { compensations: true } },
        compensations: { select: { totalComp: true } },
      },
    });

    return companies.map((c) => {
      const tcs = c.compensations.map((x) => x.totalComp);
      const sorted = [...tcs].sort((a, b) => a - b);
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        tier: c.tier,
        count: c._count.compensations,
        medianTC: Math.round(percentile(sorted, 50)),
        p25TC: Math.round(percentile(sorted, 25)),
        p75TC: Math.round(percentile(sorted, 75)),
      };
    });
  } catch {
    return [];
  }
}

const TIER_ORDER = { FAANG: 0, TIER1: 1, MID: 2, STARTUP: 3 };

export default async function CompaniesPage() {
  const companies = await getCompanies();
  const grouped = companies.reduce(
    (acc, c) => {
      const tier = c.tier as keyof typeof TIER_ORDER;
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(c);
      return acc;
    },
    {} as Record<string, typeof companies>
  );

  const tiers = Object.keys(grouped).sort(
    (a, b) =>
      (TIER_ORDER[a as keyof typeof TIER_ORDER] ?? 9) -
      (TIER_ORDER[b as keyof typeof TIER_ORDER] ?? 9)
  );

  const tierLabels: Record<string, string> = {
    FAANG: "FAANG & Big Tech",
    TIER1: "Top Indian Tech",
    MID: "Mid-tier",
    STARTUP: "Startups",
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">
          {companies.length} companies tracked — click to see level breakdowns
        </p>
      </div>

      {tiers.map((tier) => (
        <section key={tier} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <TierBadge tier={tier} />
            <h2 className="text-sm font-semibold text-slate-700">
              {tierLabels[tier] ?? tier}
            </h2>
            <span className="text-xs text-slate-400">{grouped[tier].length} companies</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[tier].map((c) => (
              <Link key={c.id} href={`/companies/${c.slug}`}>
                <div className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900 group-hover:text-indigo-700">
                        {c.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">{c.count} data points</p>
                    </div>
                    <TierBadge tier={c.tier} />
                  </div>

                  {c.count > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xl font-bold tabular-nums text-emerald-700">
                        {formatLakhs(c.medianTC)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        P25 {formatLakhs(c.p25TC)} · P75 {formatLakhs(c.p75TC)}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
