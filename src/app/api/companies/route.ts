import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { percentile } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const tier = searchParams.get("tier");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.normalizedName = { contains: search.toLowerCase().trim(), mode: "insensitive" };
    }
    if (tier) {
      where.tier = tier.toUpperCase();
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { compensations: { _count: "desc" } },
        include: {
          _count: { select: { compensations: true } },
          compensations: {
            select: { totalComp: true },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    const data = companies.map((c) => {
      const tcs = c.compensations.map((comp) => comp.totalComp).sort((a, b) => a - b);
      const avg = tcs.length ? tcs.reduce((s, v) => s + v, 0) / tcs.length : 0;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        tier: c.tier,
        logoUrl: c.logoUrl,
        _count: c._count,
        avgTotalComp: Math.round(avg),
        medianTotalComp: Math.round(percentile(tcs, 50)),
        minTotalComp: tcs[0] ?? 0,
        maxTotalComp: tcs[tcs.length - 1] ?? 0,
      };
    });

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
