"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Building2,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Search,
  RefreshCw,
  GraduationCap,
  DoorOpen,
  Monitor,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const API = "http://localhost:3000/api";

type User = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
};

type Stats = {
  users: number;
  students: number;
  departments: number;
  courses: number;
  subjects: number;
  buildings: number;
  rooms: number;
  resources: number;
  bookings: number;
  attendanceSessions: number;
  pendingBookings: number;
  approvedBookings: number;
  availableRooms: number;
  availableResources: number;
};

type Student = {
  id: string;
  rollNumber: string;
  registrationNo: string;
  admissionYear: number;
  currentSemester: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    name: string;
    code: string;
  };
};

type Booking = {
  id: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: string;
};

type Page =
  | "dashboard"
  | "students"
  | "academics"
  | "attendance"
  | "facilities"
  | "bookings";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [page, setPage] = useState<Page>("dashboard");

  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [error, setError] = useState("");

  const [email, setEmail] = useState("admin@campusflow.local");
  const [password, setPassword] = useState("CampusFlow@123");

  // IMPORTANT:
  // This is the actual search state.
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("campusflow_token");

    if (saved) {
      setToken(saved);
      loadEverything(saved);
    }
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoginLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("campusflow_token", data.accessToken);

      setToken(data.accessToken);
      setUser(data.user);

      await loadEverything(data.accessToken);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to login",
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadEverything(accessToken: string) {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const [dashboardResponse, meResponse] = await Promise.all([
        fetch(`${API}/dashboard/overview`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API}/users/me`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (!dashboardResponse.ok) {
        logout();
        return;
      }

      const dashboard = await dashboardResponse.json();

      setStats(dashboard);

      if (meResponse.ok) {
        const meData = await meResponse.json();
        setUser(meData);
      }

      // -----------------------------------------
      // STUDENTS
      // -----------------------------------------

      try {
        const studentResponse = await fetch(
          `${API}/academic/students`,
          {
            headers,
            cache: "no-store",
          },
        );

        if (studentResponse.ok) {
          const studentData = await studentResponse.json();

          const studentList = Array.isArray(studentData)
            ? studentData
            : studentData.data || [];

          setStudents(studentList);
        } else {
          console.error(
            "Students API failed:",
            studentResponse.status,
          );
        }
      } catch (studentError) {
        console.error(
          "Failed to load students:",
          studentError,
        );
      }

      // -----------------------------------------
      // BOOKINGS
      // -----------------------------------------

      try {
        const bookingResponse = await fetch(
          `${API}/bookings`,
          {
            headers,
            cache: "no-store",
          },
        );

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();

          const bookingList = Array.isArray(bookingData)
            ? bookingData
            : bookingData.data || [];

          setBookings(bookingList);
        }
      } catch (bookingError) {
        console.error(
          "Failed to load bookings:",
          bookingError,
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("campusflow_token");

    setToken(null);
    setUser(null);
    setStats(null);
    setStudents([]);
    setBookings([]);

    setPage("dashboard");
    setMobileMenu(false);
    setStudentSearch("");
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMobileMenu(false);

    // Clear student search when leaving student page.
    if (nextPage !== "students") {
      setStudentSearch("");
    }
  }

  // -----------------------------------------
  // STUDENT SEARCH
  // -----------------------------------------

  const filteredStudents = students.filter((student) => {
    const search = studentSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const searchableText = [
      student.user?.firstName,
      student.user?.lastName,
      student.user?.email,
      student.rollNumber,
      student.registrationNo,
      student.course?.name,
      student.course?.code,
      student.currentSemester,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  });

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06101d] px-5">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-black shadow-xl shadow-blue-600/30">
              C
            </div>

            <h1 className="text-4xl font-bold text-white">
              CampusFlow
            </h1>

            <p className="mt-2 text-slate-400">
              Smart Campus Management Platform
            </p>
          </div>

          <form
            onSubmit={login}
            className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl backdrop-blur-xl"
          >
            <h2 className="text-xl font-semibold text-white">
              Welcome back
            </h2>

            <p className="mb-7 mt-1 text-sm text-slate-400">
              Sign in to manage your campus
            </p>

            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const navigation = [
    {
      id: "dashboard" as Page,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "students" as Page,
      label: "Students",
      icon: Users,
    },
    {
      id: "academics" as Page,
      label: "Academics",
      icon: BookOpen,
    },
    {
      id: "attendance" as Page,
      label: "Attendance",
      icon: ClipboardCheck,
    },
    {
      id: "facilities" as Page,
      label: "Facilities",
      icon: Building2,
    },
    {
      id: "bookings" as Page,
      label: "Bookings",
      icon: CalendarDays,
    },
  ];

  const statCards = [
    {
      title: "Students",
      value: stats?.students ?? 0,
      icon: GraduationCap,
    },
    {
      title: "Courses",
      value: stats?.courses ?? 0,
      icon: BookOpen,
    },
    {
      title: "Rooms",
      value: stats?.rooms ?? 0,
      icon: DoorOpen,
    },
    {
      title: "Resources",
      value: stats?.resources ?? 0,
      icon: Monitor,
    },
    {
      title: "Bookings",
      value: stats?.bookings ?? 0,
      icon: CalendarDays,
    },
    {
      title: "Attendance",
      value: stats?.attendanceSessions ?? 0,
      icon: ClipboardCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#091525]/95 px-5 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold">
            C
          </div>

          <span className="font-bold">
            CampusFlow
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-lg p-2 hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenu && (
        <div className="fixed inset-0 z-30 bg-[#091525] pt-20 lg:hidden">
          <nav className="space-y-2 p-5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 ${
                    page === item.id
                      ? "bg-blue-600"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#091525] p-5 lg:block">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              C
            </div>

            <div>
              <div className="font-bold">
                CampusFlow
              </div>

              <div className="text-xs text-slate-500">
                Campus Management
              </div>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    page === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-12 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-400">
                CampusFlow
              </div>

              <h1 className="mt-1 text-xl font-bold capitalize">
                {page}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (token) {
                    loadEverything(token);
                  }
                }}
                className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
                title="Refresh"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading ? "animate-spin" : ""
                  }
                />
              </button>

              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </div>

                <div className="text-xs text-slate-500">
                  {user?.roles?.join(", ")}
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
                {user?.firstName?.[0] || "A"}
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-10">
            {/* DASHBOARD */}
            {page === "dashboard" && (
              <div>
                <div className="mb-8">
                  <p className="text-sm text-slate-500">
                    Overview
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    Good to see you,{" "}
                    {user?.firstName || "Admin"} 👋
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Here&apos;s what&apos;s happening across
                    your campus.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Icon size={21} />
                          </div>

                          <span className="text-xs text-emerald-400">
                            Live
                          </span>
                        </div>

                        <div className="mt-6 text-3xl font-bold">
                          {card.value}
                        </div>

                        <div className="mt-1 text-sm text-slate-400">
                          {card.title}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <h3 className="font-semibold">
                      Booking Overview
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-yellow-500/10 p-5">
                        <Clock3
                          className="text-yellow-400"
                          size={20}
                        />

                        <div className="mt-4 text-2xl font-bold text-yellow-400">
                          {stats?.pendingBookings ?? 0}
                        </div>

                        <div className="text-sm text-slate-400">
                          Pending
                        </div>
                      </div>

                      <div className="rounded-xl bg-emerald-500/10 p-5">
                        <CheckCircle2
                          className="text-emerald-400"
                          size={20}
                        />

                        <div className="mt-4 text-2xl font-bold text-emerald-400">
                          {stats?.approvedBookings ?? 0}
                        </div>

                        <div className="text-sm text-slate-400">
                          Approved
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <h3 className="font-semibold">
                      Campus Availability
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-blue-500/10 p-5">
                        <DoorOpen
                          className="text-blue-400"
                          size={20}
                        />

                        <div className="mt-4 text-2xl font-bold text-blue-400">
                          {stats?.availableRooms ?? 0}
                        </div>

                        <div className="text-sm text-slate-400">
                          Available Rooms
                        </div>
                      </div>

                      <div className="rounded-xl bg-purple-500/10 p-5">
                        <Monitor
                          className="text-purple-400"
                          size={20}
                        />

                        <div className="mt-4 text-2xl font-bold text-purple-400">
                          {stats?.availableResources ?? 0}
                        </div>

                        <div className="text-sm text-slate-400">
                          Available Resources
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDENTS */}
            {page === "students" && (
              <div>
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-sm text-blue-400">
                      Academic Management
                    </p>

                    <h2 className="mt-1 text-3xl font-bold">
                      Students
                    </h2>

                    <p className="mt-2 text-slate-400">
                      Manage enrolled students and their
                      academic information.
                    </p>
                  </div>

                  {/* FIXED SEARCH BOX */}
                  <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 transition focus-within:border-blue-500/50 focus-within:bg-white/[0.06] md:w-80">
                    <Search
                      size={17}
                      className="shrink-0 text-slate-500"
                    />

                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) =>
                        setStudentSearch(e.target.value)
                      }
                      placeholder="Search students..."
                      className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />

                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() =>
                          setStudentSearch("")
                        }
                        className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-white"
                        aria-label="Clear search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search result count */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {studentSearch
                      ? `${filteredStudents.length} result${
                          filteredStudents.length === 1
                            ? ""
                            : "s"
                        } found`
                      : `${students.length} student${
                          students.length === 1
                            ? ""
                            : "s"
                        }`}
                  </p>

                  {studentSearch && (
                    <button
                      type="button"
                      onClick={() => setStudentSearch("")}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Clear search
                    </button>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/10 bg-white/[0.03]">
                        <tr>
                          <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                            Student
                          </th>

                          <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                            Roll Number
                          </th>

                          <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                            Course
                          </th>

                          <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500">
                            Semester
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map(
                            (student) => (
                              <tr
                                key={student.id}
                                className="border-b border-white/5 hover:bg-white/[0.03]"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-medium">
                                    {
                                      student.user
                                        ?.firstName
                                    }{" "}
                                    {
                                      student.user
                                        ?.lastName
                                    }
                                  </div>

                                  <div className="text-xs text-slate-500">
                                    {
                                      student.user
                                        ?.email
                                    }
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-300">
                                  {student.rollNumber}
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-300">
                                  {student.course?.name ||
                                    "—"}
                                </td>

                                <td className="px-6 py-4">
                                  <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                                    {
                                      student.currentSemester
                                    }
                                  </span>
                                </td>
                              </tr>
                            ),
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-12 text-center"
                            >
                              <Search
                                size={32}
                                className="mx-auto text-slate-700"
                              />

                              <p className="mt-3 text-sm text-slate-500">
                                {studentSearch
                                  ? `No students found for "${studentSearch}".`
                                  : "No students found."}
                              </p>

                              {studentSearch && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStudentSearch("")
                                  }
                                  className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                                >
                                  Clear search
                                </button>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ACADEMICS */}
            {page === "academics" && (
              <div>
                <div className="mb-8">
                  <p className="text-sm text-blue-400">
                    Academic Management
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    Academics
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Courses, departments and subjects across
                    the institution.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <BookOpen className="text-blue-400" />

                    <div className="mt-6 text-4xl font-bold">
                      {stats?.departments ?? 0}
                    </div>

                    <div className="mt-1 text-slate-400">
                      Departments
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <GraduationCap className="text-purple-400" />

                    <div className="mt-6 text-4xl font-bold">
                      {stats?.courses ?? 0}
                    </div>

                    <div className="mt-1 text-slate-400">
                      Courses
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <BookOpen className="text-emerald-400" />

                    <div className="mt-6 text-4xl font-bold">
                      {stats?.subjects ?? 0}
                    </div>

                    <div className="mt-1 text-slate-400">
                      Subjects
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="text-lg font-semibold">
                    Academic System
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    CampusFlow maintains relationships between
                    departments, courses, subjects, students
                    and enrollments using a relational
                    PostgreSQL database powered by Prisma ORM.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {[
                      "Departments",
                      "Courses",
                      "Subjects",
                      "Students",
                      "Enrollments",
                      "Semesters",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ATTENDANCE */}
            {page === "attendance" && (
              <div>
                <div className="mb-8">
                  <p className="text-sm text-blue-400">
                    Academic Tracking
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    Attendance
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Track classroom sessions and student
                    attendance.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <ClipboardCheck className="text-blue-400" />

                    <div className="mt-5 text-4xl font-bold">
                      {stats?.attendanceSessions ?? 0}
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      Sessions Conducted
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <Users className="text-purple-400" />

                    <div className="mt-5 text-4xl font-bold">
                      {stats?.students ?? 0}
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      Students Tracked
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <CheckCircle2 className="text-emerald-400" />

                    <div className="mt-5 text-4xl font-bold text-emerald-400">
                      Active
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      Attendance System
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="font-semibold">
                    Attendance workflow
                  </h3>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {[
                      [
                        "01",
                        "Create Session",
                        "Faculty creates a session for a subject.",
                      ],
                      [
                        "02",
                        "Mark Attendance",
                        "Students are recorded against the session.",
                      ],
                      [
                        "03",
                        "Track Records",
                        "Attendance can be retrieved by student or subject.",
                      ],
                    ].map(
                      ([number, title, description]) => (
                        <div
                          key={number}
                          className="rounded-xl border border-white/10 bg-black/10 p-5"
                        >
                          <div className="text-sm font-bold text-blue-400">
                            {number}
                          </div>

                          <div className="mt-3 font-semibold">
                            {title}
                          </div>

                          <div className="mt-2 text-sm leading-6 text-slate-500">
                            {description}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FACILITIES */}
            {page === "facilities" && (
              <div>
                <div className="mb-8">
                  <p className="text-sm text-blue-400">
                    Campus Infrastructure
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    Facilities
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Monitor rooms, buildings and campus
                    resources.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <Building2 className="text-blue-400" />

                    <div className="mt-5 text-4xl font-bold">
                      {stats?.buildings ?? 0}
                    </div>

                    <div className="text-sm text-slate-400">
                      Buildings
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <DoorOpen className="text-emerald-400" />

                    <div className="mt-5 text-4xl font-bold">
                      {stats?.rooms ?? 0}
                    </div>

                    <div className="text-sm text-slate-400">
                      Total Rooms
                    </div>

                    <div className="mt-3 text-xs text-emerald-400">
                      {stats?.availableRooms ?? 0} currently
                      available
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <Monitor className="text-purple-400" />

                    <div className="mt-5 text-4xl font-bold">
                      {stats?.resources ?? 0}
                    </div>

                    <div className="text-sm text-slate-400">
                      Resources
                    </div>

                    <div className="mt-3 text-xs text-purple-400">
                      {stats?.availableResources ?? 0}{" "}
                      currently available
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="font-semibold">
                    Resource Management
                  </h3>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      "Projectors",
                      "Computers",
                      "Air Conditioners",
                      "Lab Equipment",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/10 p-4 text-sm text-slate-300"
                      >
                        <Monitor
                          size={18}
                          className="mb-3 text-slate-500"
                        />

                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS */}
            {page === "bookings" && (
              <div>
                <div className="mb-8">
                  <p className="text-sm text-blue-400">
                    Resource Scheduling
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    Bookings
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Manage room and resource booking requests.
                  </p>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                    <Clock3 className="text-yellow-400" />

                    <div className="mt-4 text-3xl font-bold text-yellow-400">
                      {stats?.pendingBookings ?? 0}
                    </div>

                    <div className="text-sm text-slate-400">
                      Pending
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <CheckCircle2 className="text-emerald-400" />

                    <div className="mt-4 text-3xl font-bold text-emerald-400">
                      {stats?.approvedBookings ?? 0}
                    </div>

                    <div className="text-sm text-slate-400">
                      Approved
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <CalendarDays className="text-blue-400" />

                    <div className="mt-4 text-3xl font-bold text-blue-400">
                      {stats?.bookings ?? 0}
                    </div>

                    <div className="text-sm text-slate-400">
                      Total Bookings
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Booking Requests
                    </h3>

                    <CalendarDays
                      size={18}
                      className="text-slate-500"
                    />
                  </div>

                  {bookings.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center"
                        >
                          <div>
                            <div className="font-medium">
                              {booking.purpose}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {new Date(
                                booking.startTime,
                              ).toLocaleString()}
                            </div>
                          </div>

                          <span
                            className={`w-fit rounded-lg px-3 py-1 text-xs ${
                              booking.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : booking.status ===
                                    "REJECTED"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-14 text-center">
                      <CalendarDays
                        size={36}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-4 text-sm text-slate-500">
                        No booking records available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}