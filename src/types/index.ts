export type CompanyTier = "FAANG" | "TIER1" | "MID" | "STARTUP";

export interface CompanyWithStats {
  id: string;
  name: string;
  slug: string;
  tier: CompanyTier;
  logoUrl: string | null;
  _count: { compensations: number };
  avgTotalComp: number;
  medianTotalComp: number;
  minTotalComp: number;
  maxTotalComp: number;
}

export interface CompensationEntry {
  id: string;
  company: { id: string; name: string; slug: string; tier: CompanyTier };
  role: string;
  level: string;
  levelOrder: number;
  location: string;
  country: string;
  currency: string;
  baseSalary: number;
  bonus: number;
  stockPerYear: number;
  totalComp: number;
  yearsExperience: number | null;
  verified: boolean;
  submittedAt: string;
}

export interface CompensationFilters {
  company?: string;
  role?: string;
  level?: string;
  location?: string;
  currency?: string;
  minTC?: number;
  maxTC?: number;
  page?: number;
  limit?: number;
  sortBy?: "totalComp" | "submittedAt" | "level";
  sortDir?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CompanyComparisonData {
  company: string;
  level: string;
  p25: number;
  p50: number;
  p75: number;
  count: number;
}

export interface LevelBreakdown {
  level: string;
  levelOrder: number;
  count: number;
  medianBase: number;
  medianBonus: number;
  medianStock: number;
  medianTC: number;
}
