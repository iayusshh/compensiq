import { CompareSelector } from "@/components/compensation/compare-selector";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Compare Companies — CompensIQ",
};

async function getCompanyOptions() {
  try {
    const companies = await prisma.company.findMany({
      where: { compensations: { some: {} } },
      orderBy: { compensations: { _count: "desc" } },
      select: { id: true, name: true, slug: true, tier: true },
    });
    return companies;
  } catch {
    return [];
  }
}

export default async function ComparePage() {
  const companies = await getCompanyOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Compare Companies</h1>
        <p className="mt-1 text-sm text-slate-500">
          Side-by-side TC comparison across 2–3 companies
        </p>
      </div>
      <CompareSelector companies={companies} />
    </div>
  );
}
