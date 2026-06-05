import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { percentile } from "@/lib/utils";

export async function GET() {
  try {
    const [totalEntries, totalCompanies, allTCs, topRoles] = await Promise.all([
      prisma.compensation.count(),
      prisma.company.count(),
      prisma.compensation.findMany({ select: { totalComp: true } }),
      prisma.compensation.groupBy({
        by: ["role"],
        _count: { role: true },
        orderBy: { _count: { role: "desc" } },
        take: 10,
      }),
    ]);

    const tcs = allTCs.map((c) => c.totalComp);

    return NextResponse.json({
      totalEntries,
      totalCompanies,
      medianTC: Math.round(percentile(tcs, 50)),
      p25TC: Math.round(percentile(tcs, 25)),
      p75TC: Math.round(percentile(tcs, 75)),
      topRoles: topRoles.map((r) => ({ role: r.role, count: r._count.role })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
