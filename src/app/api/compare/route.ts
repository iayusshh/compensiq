import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { percentile } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companySlugs = searchParams.getAll("company"); // up to 3
    const role = searchParams.get("role");
    const level = searchParams.get("level");

    if (companySlugs.length < 2 || companySlugs.length > 3) {
      return NextResponse.json(
        { error: "Provide 2 or 3 company slugs via ?company= params" },
        { status: 400 }
      );
    }

    const companies = await prisma.company.findMany({
      where: { slug: { in: companySlugs } },
      select: { id: true, name: true, slug: true, tier: true },
    });

    if (companies.length !== companySlugs.length) {
      return NextResponse.json(
        { error: "One or more companies not found" },
        { status: 404 }
      );
    }

    const results = await Promise.all(
      companies.map(async (company) => {
        const where: Record<string, unknown> = { companyId: company.id };
        if (role) where.role = { contains: role, mode: "insensitive" };
        if (level) where.level = { contains: level, mode: "insensitive" };

        const entries = await prisma.compensation.findMany({
          where,
          select: {
            level: true,
            levelOrder: true,
            baseSalary: true,
            bonus: true,
            stockPerYear: true,
            totalComp: true,
          },
        });

        // Group by level
        const byLevel = new Map<string, { tcs: number[]; bases: number[]; bonuses: number[]; stocks: number[]; order: number }>();
        for (const e of entries) {
          const key = e.level;
          if (!byLevel.has(key)) {
            byLevel.set(key, { tcs: [], bases: [], bonuses: [], stocks: [], order: e.levelOrder });
          }
          const g = byLevel.get(key)!;
          g.tcs.push(e.totalComp);
          g.bases.push(e.baseSalary);
          g.bonuses.push(e.bonus);
          g.stocks.push(e.stockPerYear);
        }

        const levels = Array.from(byLevel.entries())
          .map(([lv, g]) => ({
            level: lv,
            levelOrder: g.order,
            count: g.tcs.length,
            p25: Math.round(percentile(g.tcs, 25)),
            p50: Math.round(percentile(g.tcs, 50)),
            p75: Math.round(percentile(g.tcs, 75)),
            medianBase: Math.round(percentile(g.bases, 50)),
            medianBonus: Math.round(percentile(g.bonuses, 50)),
            medianStock: Math.round(percentile(g.stocks, 50)),
          }))
          .sort((a, b) => a.levelOrder - b.levelOrder);

        const allTCs = entries.map((e) => e.totalComp);
        return {
          company: { id: company.id, name: company.name, slug: company.slug, tier: company.tier },
          totalCount: entries.length,
          overallMedian: Math.round(percentile(allTCs, 50)),
          overallP25: Math.round(percentile(allTCs, 25)),
          overallP75: Math.round(percentile(allTCs, 75)),
          levels,
        };
      })
    );

    return NextResponse.json({ companies: results, filters: { role, level } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
