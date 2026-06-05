import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatLakhs, percentile } from "@/lib/utils";
import { StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getStats() {
  try {
    const [totalEntries, totalCompanies, allTCs, topRoles] = await Promise.all([
      prisma.compensation.count(),
      prisma.company.count(),
      prisma.compensation.findMany({ select: { totalComp: true } }),
      prisma.compensation.groupBy({
        by: ["role"],
        _count: { role: true },
        orderBy: { _count: { role: "desc" } },
        take: 5,
      }),
    ]);
    const tcs = allTCs.map((c) => c.totalComp);
    return {
      totalEntries,
      totalCompanies,
      medianTC: Math.round(percentile(tcs, 50)),
      topRoles: topRoles.map((r) => ({ role: r.role, count: r._count.role })),
    };
  } catch {
    return { totalEntries: 0, totalCompanies: 0, medianTC: 0, topRoles: [] };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Know What You{"'"}re Worth
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Real, anonymous compensation data for engineering and product roles in India.
          Levels matter more than titles — compare TC by level, company, and role.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/salaries">
            <Button size="lg">Browse Salaries</Button>
          </Link>
          <Link href="/submit">
            <Button variant="secondary" size="lg">Add Your Salary</Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Salary Entries"
            value={stats.totalEntries.toLocaleString()}
            sub="Anonymous submissions"
          />
          <StatCard
            label="Companies Tracked"
            value={stats.totalCompanies.toLocaleString()}
            sub="From startups to FAANG"
          />
          <StatCard
            label="Median Total Comp"
            value={formatLakhs(stats.medianTC)}
            sub="Across all roles & levels"
          />
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-gray-900">What you can do</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/salaries",
              icon: "📊",
              title: "Salary Table",
              desc: "Search and filter thousands of real salary entries by company, role, level, and location.",
            },
            {
              href: "/companies",
              icon: "🏢",
              title: "Company Pages",
              desc: "View aggregated TC data per company with level breakdowns, P25/P50/P75 distributions.",
            },
            {
              href: "/compare",
              icon: "⚖️",
              title: "Compare Companies",
              desc: "Side-by-side TC comparison across 2–3 companies with level-by-level analysis.",
            },
          ].map((f) => (
            <Link key={f.href} href={f.href} className="group block">
              <div className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-blue-700">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top roles */}
      {stats.topRoles.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Most common roles</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topRoles.map((r) => (
              <Link
                key={r.role}
                href={`/salaries?role=${encodeURIComponent(r.role)}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {r.role} <span className="text-gray-400">({r.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
