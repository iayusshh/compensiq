"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatLakhs } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const ROLES = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer",
  "Engineering Manager", "Product Manager", "Senior PM", "Data Scientist", "Data Engineer",
  "DevOps Engineer", "Site Reliability Engineer", "Designer", "Product Designer",
  "Technical Program Manager", "Recruiter", "Other",
];

const LEVELS = [
  "Intern", "Junior", "L3", "L4", "SDE1", "SDE2", "Mid", "Senior",
  "L5", "SDE3", "Senior SDE", "Staff", "L6", "Principal", "Principal SDE", "L7", "L8", "IC7", "Fellow",
  "EM", "Senior EM", "Director", "VP",
];

const LOCATIONS = [
  "Bangalore", "Hyderabad", "Pune", "Mumbai", "Gurgaon", "Chennai", "Noida",
  "Delhi NCR", "Kolkata", "Remote", "Other",
];

const CURRENCIES = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
];

interface FormData {
  companyName: string;
  role: string;
  level: string;
  location: string;
  currency: string;
  baseSalary: string;
  bonus: string;
  stockPerYear: string;
  yearsExperience: string;
}

interface FormErrors {
  companyName?: string;
  role?: string;
  level?: string;
  location?: string;
  baseSalary?: string;
}

export function SubmitForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    companyName: "",
    role: "",
    level: "",
    location: "",
    currency: "INR",
    baseSalary: "",
    bonus: "",
    stockPerYear: "",
    yearsExperience: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const base = parseFloat(form.baseSalary) || 0;
  const bonus = parseFloat(form.bonus) || 0;
  const stock = parseFloat(form.stockPerYear) || 0;
  const totalComp = base + bonus + stock;

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    if (!form.role) errs.role = "Role is required";
    if (!form.level) errs.level = "Level is required";
    if (!form.location) errs.location = "Location is required";
    if (!form.baseSalary || isNaN(parseFloat(form.baseSalary)) || parseFloat(form.baseSalary) <= 0) {
      errs.baseSalary = "Valid base salary is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/compensations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          role: form.role,
          level: form.level,
          location: form.location,
          currency: form.currency,
          baseSalary: parseFloat(form.baseSalary),
          bonus: parseFloat(form.bonus) || 0,
          stockPerYear: parseFloat(form.stockPerYear) || 0,
          yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/salaries"), 2000);
      } else {
        const err = await res.json();
        if (err.details) {
          const fieldErrors = err.details.fieldErrors ?? {};
          const mapped: FormErrors = {};
          if (fieldErrors.companyName) mapped.companyName = fieldErrors.companyName[0];
          if (fieldErrors.baseSalary) mapped.baseSalary = fieldErrors.baseSalary[0];
          setErrors(mapped);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Submitted — thank you</h2>
        <p className="mt-1 text-sm text-slate-500">Redirecting to the salary table...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-slate-200 bg-white">
        {/* Section: Role info */}
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Role details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Company Name"
              placeholder="e.g. Google, Flipkart, Razorpay"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              error={errors.companyName}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              options={ROLES.map((r) => ({ value: r, label: r }))}
              placeholder="Select role"
              error={errors.role}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              label="Level"
              value={form.level}
              onChange={(v) => setForm({ ...form, level: v })}
              options={LEVELS.map((l) => ({ value: l, label: l }))}
              placeholder="Select level"
              error={errors.level}
            />
            <Select
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
              options={LOCATIONS.map((l) => ({ value: l, label: l }))}
              placeholder="Select location"
              error={errors.location}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              label="Currency"
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={CURRENCIES}
            />
            <Input
              label="Years of Experience"
              type="number"
              min={0}
              max={50}
              placeholder="e.g. 3"
              value={form.yearsExperience}
              onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
              hint="Optional"
            />
          </div>
        </div>

        {/* Section: Compensation */}
        <div className="px-6 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Annual compensation</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Input
              label="Base Salary"
              type="number"
              min={0}
              step={1000}
              placeholder="e.g. 2500000"
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              error={errors.baseSalary}
              hint="Annual base in selected currency"
            />
            <Input
              label="Bonus"
              type="number"
              min={0}
              step={1000}
              placeholder="e.g. 300000"
              value={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              hint="Annual, optional"
            />
            <Input
              label="Equity / RSU (annualized)"
              type="number"
              min={0}
              step={1000}
              placeholder="e.g. 800000"
              value={form.stockPerYear}
              onChange={(e) => setForm({ ...form, stockPerYear: e.target.value })}
              hint="Annual value, optional"
            />
          </div>

          {/* TC preview */}
          {totalComp > 0 && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Total Comp</span>
                <span className="text-2xl font-bold tabular-nums text-emerald-700">{formatLakhs(totalComp)}</span>
              </div>
              <p className="mt-0.5 text-xs text-emerald-600/70">
                {formatLakhs(base)} base
                {bonus > 0 && ` + ${formatLakhs(bonus)} bonus`}
                {stock > 0 && ` + ${formatLakhs(stock)} equity`}
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button type="submit" loading={submitting} size="lg" className="w-full">
              Submit Anonymously
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
