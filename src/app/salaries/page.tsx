import { prisma } from "@/lib/prisma";
import { SalaryTable } from "@/components/compensation/salary-table";
import type { CompensationEntry, PaginatedResponse } from "@/types";

export const metadata = {
  title: "Salary Table — CompensIQ",
  description: "Browse real salary data for engineering roles in India",
};

async function getInitialData(): Promise<PaginatedResponse<CompensationEntry>> {
  try {
    const [data, total] = await Promise.all([
      prisma.compensation.findMany({
        take: 20,
        orderBy: { totalComp: "desc" },
        select: {
          id: true,
          role: true,
          level: true,
          levelOrder: true,
          location: true,
          country: true,
          currency: true,
          baseSalary: true,
          bonus: true,
          stockPerYear: true,
          totalComp: true,
          yearsExperience: true,
          verified: true,
          submittedAt: true,
          company: { select: { id: true, name: true, slug: true, tier: true } },
        },
      }),
      prisma.compensation.count(),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        submittedAt: d.submittedAt.toISOString(),
      })) as CompensationEntry[],
      total,
      page: 1,
      limit: 20,
      totalPages: Math.ceil(total / 20),
    };
  } catch {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export default async function SalariesPage() {
  const initialData = await getInitialData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salary Table</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real compensation data — filter by company, role, level, and location
        </p>
      </div>
      <SalaryTable initialData={initialData} />
    </div>
  );
}
