"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          "h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface SelectProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  error,
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          error && "border-red-400 focus:border-red-500",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
