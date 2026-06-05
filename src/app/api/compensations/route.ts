import { NextRequest, NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  normalizeCompanyName,
  slugify,
  levelToOrder,
  computeTotalComp,
} from "@/lib/utils";

const compensationSchema = z.object({
  companyName: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  level: z.string().min(1).max(50),
  location: z.string().min(1).max(200),
  country: z.string().default("India"),
  currency: z.string().default("INR"),
  baseSalary: z.number().positive(),
  bonus: z.number().min(0).default(0),
  stockPerYear: z.number().min(0).default(0),
  yearsExperience: z.number().int().min(0).max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    const company = searchParams.get("company");
    const role = searchParams.get("role");
    const level = searchParams.get("level");
    const location = searchParams.get("location");
    const currency = searchParams.get("currency");
    const minTC = searchParams.get("minTC");
    const maxTC = searchParams.get("maxTC");
    const sortBy = searchParams.get("sortBy") ?? "submittedAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

    if (company) {
      where.company = {
        normalizedName: {
          contains: normalizeCompanyName(company),
          mode: "insensitive",
        },
      };
    }
    if (role) {
      where.role = { contains: role, mode: "insensitive" };
    }
    if (level) {
      where.level = { contains: level, mode: "insensitive" };
    }
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }
    if (currency) {
      where.currency = currency.toUpperCase();
    }
    if (minTC || maxTC) {
      where.totalComp = {};
      if (minTC) (where.totalComp as Record<string, number>).gte = parseFloat(minTC);
      if (maxTC) (where.totalComp as Record<string, number>).lte = parseFloat(maxTC);
    }

    const dir: Prisma.SortOrder = sortDir === "asc" ? "asc" : "desc";
    const orderByMap: Record<string, Prisma.CompensationOrderByWithRelationInput> = {
      totalComp: { totalComp: dir },
      submittedAt: { submittedAt: dir },
      levelOrder: { levelOrder: dir },
    };
    const orderBy = orderByMap[sortBy] ?? { submittedAt: dir };

    const [data, total] = await Promise.all([
      prisma.compensation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          company: {
            select: { id: true, name: true, slug: true, tier: true },
          },
        },
      }),
      prisma.compensation.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = compensationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      companyName,
      role,
      level,
      location,
      country,
      currency,
      baseSalary,
      bonus,
      stockPerYear,
      yearsExperience,
    } = parsed.data;

    const normalizedName = normalizeCompanyName(companyName);
    const slug = slugify(companyName);

    // Upsert company — handles dedup via normalized name
    const company = await prisma.company.upsert({
      where: { normalizedName },
      create: {
        name: companyName.trim(),
        normalizedName,
        slug: await resolveUniqueSlug(slug),
      },
      update: {},
    });

    const totalComp = computeTotalComp(baseSalary, bonus, stockPerYear);
    const levelOrder = levelToOrder(level);

    const compensation = await prisma.compensation.create({
      data: {
        companyId: company.id,
        userId: session?.user?.id ?? null,
        role: role.trim(),
        level: level.trim(),
        levelOrder,
        location: location.trim(),
        country,
        currency: currency.toUpperCase(),
        baseSalary,
        bonus,
        stockPerYear,
        totalComp,
        yearsExperience: yearsExperience ?? null,
      },
      include: { company: { select: { name: true, slug: true } } },
    });

    return NextResponse.json(compensation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function resolveUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
