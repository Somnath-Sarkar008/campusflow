"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logout } from "@/lib/auth";

type Stats = {
  students: number;
  departments: number;
  courses: number;
  subjects: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    students: 0,
    departments: 0,
    courses: 0,
    subjects: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userResponse = await api.get("/users/me");
        setUser(userResponse.data);

        const [
          studentsResponse,
          departmentsResponse,
          coursesResponse,
          subjectsResponse,
        ] = await Promise.all([
          api.get("/academic/students"),
          api.get("/academic/departments"),
          api.get("/academic/courses"),
          api.get("/academic/subjects"),
        ]);

        setStats({
          students: Array.isArray(studentsResponse.data)
            ? studentsResponse.data.length
            : 0,

          departments: Array.isArray(departmentsResponse.data)
            ? departmentsResponse.data.length
            : 0,

          courses: Array.isArray(coursesResponse.data)
            ? coursesResponse.data.length
            : 0,

          subjects: Array.isArray(subjectsResponse.data)
            ? subjectsResponse.data.length
            : 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading CampusFlow...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">CampusFlow</h1>
            <p className="text-sm text-slate-400">
              Smart Campus Management System
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs text-slate-400">
                {user?.roles?.join(", ")}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <section>
          <p className="text-sm text-slate-400">Overview</p>

          <h2 className="mt-1 text-3xl font-bold">
            Good to see you, {user?.firstName}.
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your campus operations from one place.
          </p>
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Students"
            value={stats.students}
            description="Registered students"
          />

          <StatCard
            title="Departments"
            value={stats.departments}
            description="Academic departments"
          />

          <StatCard
            title="Courses"
            value={stats.courses}
            description="Active courses"
          />

          <StatCard
            title="Subjects"
            value={stats.subjects}
            description="Academic subjects"
          />
        </section>

        {/* Modules */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            title="Academic Management"
            description="Manage departments, courses, subjects and students."
            onClick={() => router.push("/academic")}
          />

          <ModuleCard
            title="Attendance"
            description="Create sessions and manage student attendance."
            onClick={() => router.push("/attendance")}
          />

          <ModuleCard
            title="Room & Resources"
            description="Manage campus rooms, equipment and bookings."
            onClick={() => router.push("/resources")}
          />
        </section>

        {/* User information */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">
            Account Information
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="First Name" value={user?.firstName} />
            <Info label="Last Name" value={user?.lastName} />
            <Info label="Email" value={user?.email} />
            <Info
              label="Role"
              value={user?.roles?.join(", ")}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-3 text-4xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ModuleCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800"
    >
      <h3 className="text-lg font-semibold group-hover:text-blue-400">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <p className="mt-5 text-sm font-medium text-blue-400">
        Open module →
      </p>
    </button>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}