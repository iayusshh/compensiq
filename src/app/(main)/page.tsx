import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatLakhs, percentile } from "@/lib/utils";
import { BarChart3, Building2, Scale } from "lucide-react";
import { HeroContent } from "@/components/ui/hero-section";
import { StatsBar } from "@/components/compensation/stats-bar";

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
        take: 6,
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
    <div className="-mx-6 -mt-10 space-y-0">
      {/* Hero — uses prebuiltui/hero-section (21st.dev) HeroContent */}
      <HeroContent
        title="Know exactly what your next offer"
        titleAccent="should be."
        description="Real, anonymous compensation data for engineering and product roles across India. By level. By company. No ranges, no fluff."
        primaryCta={{ label: "Browse Salaries", href: "/salaries" }}
        secondaryCta={{ label: "Share Your Salary", href: "/submit" }}
      />

      {/* Stats — uses AnimatedCount from reuno-ui/animated-number (21st.dev) */}
      <div className="px-6 pt-6">
        <StatsBar
          totalEntries={stats.totalEntries}
          totalCompanies={stats.totalCompanies}
          medianTC={stats.medianTC}
        />
      </div>

      {/* Features */}
      <section className="px-6 pt-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
          What you can do
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/salaries",
              icon: <BarChart3 className="h-5 w-5" />,
              title: "Salary Table",
              desc: "Search and filter real salary entries by company, role, level, and location.",
            },
            {
              href: "/companies",
              icon: <Building2 className="h-5 w-5" />,
              title: "Company Profiles",
              desc: "Level breakdowns with P25/P50/P75 TC distributions for every tracked company.",
            },
            {
              href: "/compare",
              icon: <Scale className="h-5 w-5" />,
              title: "Compare Companies",
              desc: "Side-by-side TC comparison across 2–3 companies with level-by-level analysis.",
            },
          ].map((f) => (
            <Link key={f.href} href={f.href} className="group">
              <div className="h-full rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top roles */}
      {stats.topRoles.length > 0 && (
        <section className="border-t border-slate-200 px-6 pt-10 pb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Browse by role
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.topRoles.map((r) => (
              <Link
                key={r.role}
                href={`/salaries?role=${encodeURIComponent(r.role)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {r.role}
                <span className="ml-1.5 text-slate-200">·</span>
                <span className="ml-1 text-slate-400">{r.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
