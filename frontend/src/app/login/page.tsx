"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      saveToken(response.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-5 py-10 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-5 flex items-center justify-center gap-3">
          <img src="/campusflow-logo.svg" alt="CampusFlow logo" className="h-12 w-12 rounded-2xl shadow-xl shadow-cyan-500/20" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">CampusFlow</h1>
            <p className="text-[10px] font-medium tracking-[0.2em] text-cyan-400/80">SMART CAMPUS OS</p>
          </div>
        </div>

        <section className="rounded-3xl border border-white/[0.09] bg-white/[0.045] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">Secure access</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in to your campus command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@campusflow.local" required autoComplete="email" className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/5" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/5" />
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <button type="submit" disabled={loading} className="group relative w-full overflow-hidden rounded-xl bg-white py-3.5 font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50">
              <span className="relative">{loading ? "Signing in…" : "Sign in to CampusFlow →"}</span>
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.07] pt-5 text-center">
            <p className="text-[11px] text-slate-600">Role-based campus management · Secure API access</p>
          </div>
        </section>
      </div>
    </main>
  );
}
