import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { percentile } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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
            verified: true,
            submittedAt: true,
          },
          orderBy: { levelOrder: "asc" },
        },
        _count: { select: { compensations: true } },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Build per-level breakdown
    const levelMap = new Map<string, number[]>();
    const baseMap = new Map<string, number[]>();
    const bonusMap = new Map<string, number[]>();
    const stockMap = new Map<string, number[]>();

    for (const c of company.compensations) {
      const key = `${c.level}__${c.levelOrder}`;
      if (!levelMap.has(key)) {
        levelMap.set(key, []);
        baseMap.set(key, []);
        bonusMap.set(key, []);
        stockMap.set(key, []);
      }
      levelMap.get(key)!.push(c.totalComp);
      baseMap.get(key)!.push(c.baseSalary);
      bonusMap.get(key)!.push(c.bonus);
      stockMap.get(key)!.push(c.stockPerYear);
    }

    const levelBreakdown = Array.from(levelMap.entries())
      .map(([key, tcs]) => {
        const [level, orderStr] = key.split("__");
        return {
          level,
          levelOrder: parseInt(orderStr),
          count: tcs.length,
          medianBase: Math.round(percentile(baseMap.get(key)!, 50)),
          medianBonus: Math.round(percentile(bonusMap.get(key)!, 50)),
          medianStock: Math.round(percentile(stockMap.get(key)!, 50)),
          medianTC: Math.round(percentile(tcs, 50)),
          p25TC: Math.round(percentile(tcs, 25)),
          p75TC: Math.round(percentile(tcs, 75)),
        };
      })
      .sort((a, b) => a.levelOrder - b.levelOrder);

    const allTCs = company.compensations.map((c) => c.totalComp);

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        tier: company.tier,
        logoUrl: company.logoUrl,
        website: company.website,
        totalSubmissions: company._count.compensations,
        avgTotalComp: allTCs.length
          ? Math.round(allTCs.reduce((s, v) => s + v, 0) / allTCs.length)
          : 0,
        medianTotalComp: Math.round(percentile(allTCs, 50)),
      },
      levelBreakdown,
      recentSubmissions: company.compensations.slice(-10).reverse(),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
