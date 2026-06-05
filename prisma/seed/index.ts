import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { normalizeCompanyName, slugify, levelToOrder, computeTotalComp } from "../../src/lib/utils";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const companies = [
  { name: "Google", tier: "FAANG" as const },
  { name: "Microsoft", tier: "FAANG" as const },
  { name: "Amazon", tier: "FAANG" as const },
  { name: "Meta", tier: "FAANG" as const },
  { name: "Apple", tier: "FAANG" as const },
  { name: "Flipkart", tier: "TIER1" as const },
  { name: "Swiggy", tier: "TIER1" as const },
  { name: "Zomato", tier: "TIER1" as const },
  { name: "Meesho", tier: "TIER1" as const },
  { name: "Razorpay", tier: "TIER1" as const },
  { name: "PhonePe", tier: "TIER1" as const },
  { name: "CRED", tier: "TIER1" as const },
  { name: "Zepto", tier: "TIER1" as const },
  { name: "Ola", tier: "MID" as const },
  { name: "Paytm", tier: "MID" as const },
  { name: "Infosys", tier: "MID" as const },
  { name: "TCS", tier: "MID" as const },
  { name: "Wipro", tier: "MID" as const },
  { name: "HCL Technologies", tier: "MID" as const },
];

const roleLevelData: Array<{
  role: string;
  level: string;
  baseLPA: number;
  bonusLPA: number;
  stockLPA: number;
}> = [
  // Google - in INR LPA
  { role: "Software Engineer", level: "L3", baseLPA: 2200000, bonusLPA: 300000, stockLPA: 500000 },
  { role: "Software Engineer", level: "L4", baseLPA: 3500000, bonusLPA: 500000, stockLPA: 1000000 },
  { role: "Software Engineer", level: "L5", baseLPA: 5000000, bonusLPA: 800000, stockLPA: 2000000 },
  { role: "Software Engineer", level: "L6", baseLPA: 7000000, bonusLPA: 1200000, stockLPA: 3500000 },
  { role: "Software Engineer", level: "L7", baseLPA: 9000000, bonusLPA: 1800000, stockLPA: 6000000 },
  { role: "Product Manager", level: "L4", baseLPA: 3200000, bonusLPA: 600000, stockLPA: 900000 },
  { role: "Product Manager", level: "L5", baseLPA: 5000000, bonusLPA: 1000000, stockLPA: 2000000 },
  { role: "Data Scientist", level: "L4", baseLPA: 3000000, bonusLPA: 450000, stockLPA: 800000 },
  { role: "Data Scientist", level: "L5", baseLPA: 4500000, bonusLPA: 700000, stockLPA: 1500000 },
  // Microsoft
  { role: "Software Engineer", level: "SDE1", baseLPA: 2000000, bonusLPA: 250000, stockLPA: 400000 },
  { role: "Software Engineer", level: "SDE2", baseLPA: 3000000, bonusLPA: 400000, stockLPA: 800000 },
  { role: "Software Engineer", level: "Senior SDE", baseLPA: 4500000, bonusLPA: 600000, stockLPA: 1500000 },
  { role: "Software Engineer", level: "Principal SDE", baseLPA: 7000000, bonusLPA: 1000000, stockLPA: 3000000 },
  { role: "Product Manager", level: "SDE2", baseLPA: 2800000, bonusLPA: 400000, stockLPA: 700000 },
  // Amazon
  { role: "Software Engineer", level: "SDE1", baseLPA: 1800000, bonusLPA: 200000, stockLPA: 350000 },
  { role: "Software Engineer", level: "SDE2", baseLPA: 2800000, bonusLPA: 300000, stockLPA: 700000 },
  { role: "Software Engineer", level: "SDE3", baseLPA: 4500000, bonusLPA: 500000, stockLPA: 1600000 },
  // Flipkart
  { role: "Software Engineer", level: "SDE1", baseLPA: 1600000, bonusLPA: 150000, stockLPA: 200000 },
  { role: "Software Engineer", level: "SDE2", baseLPA: 2500000, bonusLPA: 250000, stockLPA: 400000 },
  { role: "Software Engineer", level: "SDE3", baseLPA: 3800000, bonusLPA: 400000, stockLPA: 800000 },
  { role: "Product Manager", level: "Senior PM", baseLPA: 3500000, bonusLPA: 500000, stockLPA: 600000 },
  // Swiggy
  { role: "Software Engineer", level: "SDE1", baseLPA: 1400000, bonusLPA: 120000, stockLPA: 150000 },
  { role: "Software Engineer", level: "SDE2", baseLPA: 2200000, bonusLPA: 200000, stockLPA: 300000 },
  { role: "Software Engineer", level: "SDE3", baseLPA: 3500000, bonusLPA: 350000, stockLPA: 600000 },
  // Razorpay
  { role: "Software Engineer", level: "SDE2", baseLPA: 2400000, bonusLPA: 220000, stockLPA: 350000 },
  { role: "Software Engineer", level: "Senior SDE", baseLPA: 4000000, bonusLPA: 450000, stockLPA: 800000 },
  { role: "Data Scientist", level: "Senior", baseLPA: 3500000, bonusLPA: 300000, stockLPA: 500000 },
  // TCS
  { role: "Software Engineer", level: "Junior", baseLPA: 700000, bonusLPA: 50000, stockLPA: 0 },
  { role: "Software Engineer", level: "Mid", baseLPA: 1000000, bonusLPA: 80000, stockLPA: 0 },
  { role: "Software Engineer", level: "Senior", baseLPA: 1600000, bonusLPA: 120000, stockLPA: 0 },
  // Infosys
  { role: "Software Engineer", level: "Junior", baseLPA: 650000, bonusLPA: 40000, stockLPA: 0 },
  { role: "Software Engineer", level: "Mid", baseLPA: 900000, bonusLPA: 70000, stockLPA: 0 },
  { role: "Software Engineer", level: "Senior", baseLPA: 1400000, bonusLPA: 100000, stockLPA: 0 },
];

function jitter(base: number, pct = 0.15): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct));
}

const locations = ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Gurgaon", "Chennai", "Noida"];

async function main() {
  console.log("Seeding database...");

  // Seed companies
  for (const c of companies) {
    await prisma.company.upsert({
      where: { normalizedName: normalizeCompanyName(c.name) },
      create: {
        name: c.name,
        normalizedName: normalizeCompanyName(c.name),
        slug: slugify(c.name),
        tier: c.tier,
      },
      update: { tier: c.tier },
    });
  }

  const companyMap = await prisma.company.findMany();
  const nameToId = new Map(companyMap.map((c) => [c.name, c.id]));

  // Map company names to role data
  const companyRoleMap: Record<string, typeof roleLevelData[0][]> = {
    Google: roleLevelData.filter((_, i) => i < 9),
    Microsoft: roleLevelData.filter((_, i) => i >= 9 && i < 14),
    Amazon: roleLevelData.filter((_, i) => i >= 14 && i < 17),
    Flipkart: roleLevelData.filter((_, i) => i >= 17 && i < 21),
    Swiggy: roleLevelData.filter((_, i) => i >= 21 && i < 24),
    Razorpay: roleLevelData.filter((_, i) => i >= 24 && i < 27),
    TCS: roleLevelData.filter((_, i) => i >= 27 && i < 30),
    Infosys: roleLevelData.filter((_, i) => i >= 30),
  };

  // Generate 8-15 entries per role/level combo per company
  for (const [compName, roles] of Object.entries(companyRoleMap)) {
    const compId = nameToId.get(compName);
    if (!compId) continue;

    for (const r of roles) {
      const count = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const base = jitter(r.baseLPA);
        const bonus = jitter(r.bonusLPA);
        const stock = jitter(r.stockLPA);
        const tc = computeTotalComp(base, bonus, stock);
        await prisma.compensation.create({
          data: {
            companyId: compId,
            role: r.role,
            level: r.level,
            levelOrder: levelToOrder(r.level),
            location: locations[Math.floor(Math.random() * locations.length)],
            country: "India",
            currency: "INR",
            baseSalary: base,
            bonus,
            stockPerYear: stock,
            totalComp: tc,
            yearsExperience: Math.floor(Math.random() * 12),
            source: "seed",
          },
        });
      }
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
