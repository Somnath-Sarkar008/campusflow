"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logout } from "@/lib/auth";

type Stats = { students: number; departments: number; courses: number; subjects: number };

const modules = [
  ["Academic Management", "Departments, courses, subjects and student records.", "/academic", "▦"],
  ["Attendance", "Track sessions, presence and student attendance trends.", "/attendance", "✓"],
  ["Facilities", "Explore rooms, equipment and campus resources.", "/facilities", "⌂"],
  ["Bookings", "Review room and resource reservations across campus.", "/bookings", "◷"],
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({ students: 0, departments: 0, courses: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userResponse = await api.get("/users/me");
        setUser(userResponse.data);
        const [students, departments, courses, subjects] = await Promise.all([
          api.get("/academic/students"), api.get("/academic/departments"), api.get("/academic/courses"), api.get("/academic/subjects"),
        ]);
        setStats({
          students: Array.isArray(students.data) ? students.data.length : 0,
          departments: Array.isArray(departments.data) ? departments.data.length : 0,
          courses: Array.isArray(courses.data) ? courses.data.length : 0,
          subjects: Array.isArray(subjects.data) ? subjects.data.length : 0,
        });
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    loadDashboard();
  }, []);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#07111f] text-white"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" /><p className="mt-4 text-sm text-slate-400">Preparing your campus overview…</p></div></main>;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"><div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" /><div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" /><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:48px_48px]" /></div>

      <header className="relative border-b border-white/[0.07] bg-[#081525]/75 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <button onClick={() => router.push("/dashboard")} className="text-left"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black shadow-lg shadow-cyan-500/20">CF</div><div><h1 className="text-lg font-bold tracking-tight">CampusFlow</h1><p className="text-[11px] text-slate-500">SMART CAMPUS OS</p></div></div></button>
        <div className="flex items-center gap-3 sm:gap-5"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p><p className="text-[11px] uppercase tracking-wider text-cyan-400/80">{user?.roles?.join(" • ")}</p></div><button onClick={logout} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300">Logout</button></div>
      </div></header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8"><div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] px-3 py-1 text-xs font-medium text-cyan-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" /> Campus is operational</div><p className="text-sm text-slate-500">Your campus command center</p><h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Good to see you, {user?.firstName} 👋</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">A live overview of your academic ecosystem, campus facilities and day-to-day operations.</p></div><button onClick={() => router.push("/academic")} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-50">Open academics →</button></div></section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard title="Students" value={stats.students} description="Active student profiles" icon="01" /><StatCard title="Departments" value={stats.departments} description="Academic departments" icon="02" /><StatCard title="Courses" value={stats.courses} description="Programs on campus" icon="03" /><StatCard title="Subjects" value={stats.subjects} description="Subjects in curriculum" icon="04" /></section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm sm:p-7"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">Workspace</p><h3 className="mt-1 text-xl font-bold">Campus modules</h3></div><span className="text-xs text-slate-500">4 modules</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{modules.map(([title, description, href, icon]) => <button key={title} onClick={() => router.push(href)} className="group rounded-2xl border border-white/[0.07] bg-black/10 p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-cyan-400/[0.045]"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-lg text-cyan-300">{icon}</span><span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-400">→</span></div><h4 className="mt-4 font-semibold">{title}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></button>)}</div></div>
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-cyan-400/[0.08] to-indigo-500/[0.05] p-6 backdrop-blur-sm sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">Campus snapshot</p><h3 className="mt-1 text-xl font-bold">A connected campus</h3><p className="mt-2 text-sm leading-6 text-slate-400">Real academic records are now flowing through CampusFlow.</p><div className="mt-6 space-y-4"><Snapshot label="Academic records" value={`${stats.students} students`} /><Snapshot label="Curriculum" value={`${stats.courses} courses · ${stats.subjects} subjects`} /><Snapshot label="Departments" value={`${stats.departments} active`} /></div><div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" /></div><p className="mt-2 text-[11px] text-slate-500">Core campus data is synchronized</p></div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-sm sm:p-7"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p><h3 className="mt-1 text-lg font-bold">Profile & access</h3></div><span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1 text-xs font-medium text-emerald-300">● Verified account</span></div><div className="mt-5 grid gap-5 border-t border-white/[0.06] pt-5 sm:grid-cols-2 lg:grid-cols-4"><Info label="First Name" value={user?.firstName} /><Info label="Last Name" value={user?.lastName} /><Info label="Email" value={user?.email} /><Info label="Role" value={user?.roles?.join(", ")} /></div></section>
      </div>
    </main>
  );
}

function StatCard({ title, value, description, icon }: { title: string; value: number; description: string; icon: string }) { return <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.055]"><div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-400/5 blur-2xl" /><div className="relative flex items-start justify-between"><p className="text-sm text-slate-400">{title}</p><span className="font-mono text-[10px] text-slate-600">{icon}</span></div><p className="relative mt-3 text-3xl font-bold tracking-tight">{value}</p><p className="relative mt-1 text-xs text-slate-500">{description}</p></div>; }
function Snapshot({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"><span className="text-xs text-slate-500">{label}</span><span className="text-sm font-medium text-slate-200">{value}</span></div>; }
function Info({ label, value }: { label: string; value?: string }) { return <div><p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">{label}</p><p className="mt-1 truncate text-sm font-medium text-slate-200">{value || "—"}</p></div>; }
