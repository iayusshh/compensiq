import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatLakhs, percentile } from "@/lib/utils";
import { TierBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    (a, b) => (TIER_ORDER[a as keyof typeof TIER_ORDER] ?? 9) - (TIER_ORDER[b as keyof typeof TIER_ORDER] ?? 9)
  );

  const tierLabels: Record<string, string> = {
    FAANG: "FAANG & Big Tech",
    TIER1: "Top Indian Tech",
    MID: "Mid-tier Companies",
    STARTUP: "Startups",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <p className="mt-1 text-sm text-gray-500">
          {companies.length} companies tracked — click to see level breakdowns and TC distributions
        </p>
      </div>

      {tiers.map((tier) => (
        <section key={tier}>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-700">
            <TierBadge tier={tier} />
            {tierLabels[tier] ?? tier}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[tier].map((c) => (
              <Link key={c.id} href={`/companies/${c.slug}`}>
                <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-gray-400">{c.count} data points</p>
                    </div>
                    <TierBadge tier={c.tier} />
                  </div>
                  {c.count > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xl font-bold text-green-700">{formatLakhs(c.medianTC)}</p>
                      <p className="text-xs text-gray-400">
                        P25: {formatLakhs(c.p25TC)} — P75: {formatLakhs(c.p75TC)}
                      </p>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
