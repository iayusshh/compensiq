"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
      } else {
        router.push("/auth/login?registered=1");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-[100dvw]">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              Join <span className="text-indigo-600">CompensIQ</span>
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">
              Your submissions are always anonymous — an account just lets you manage your entries.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Your name"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Create Account
              </button>
            </form>

            <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-violet-400 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-12">
        <div className="max-w-sm text-center">
          <div className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
            Compens<span className="text-indigo-600">IQ</span>
          </div>
          <p className="text-slate-500 text-base leading-relaxed">
            The most transparent compensation database for engineering roles in India.
            Every submission is anonymous. Always.
          </p>
        </div>
      </section>
    </div>
  );
}
