"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Page = "dashboard" | "students" | "academics" | "attendance" | "facilities" | "bookings";
type AcademicTab = "departments" | "courses" | "subjects";
type FacilityTab = "buildings" | "rooms" | "resources";

type User = { id?: string; firstName: string; lastName: string; email: string; roles?: string[] };
type Stats = Record<string, number>;
type Student = any;
type Booking = any;
type Department = any;
type Course = any;
type Subject = any;
type Building = any;
type Room = any;
type Resource = any;

const semesters = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `SEMESTER_${n}`);
const roomTypes = ["CLASSROOM", "LAB", "SEMINAR_HALL", "AUDITORIUM", "OFFICE", "OTHER"];
const resourceTypes = ["PROJECTOR", "COMPUTER", "AIR_CONDITIONER", "LAB_EQUIPMENT", "OTHER"];

export default function InteractiveCampusFlow() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("admin@campusflow.local");
  const [password, setPassword] = useState("CampusFlow@123");
  const [loginLoading, setLoginLoading] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicTab, setAcademicTab] = useState<AcademicTab>("departments");

  const [attendanceStudent, setAttendanceStudent] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [facilityTab, setFacilityTab] = useState<FacilityTab>("buildings");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingResources, setBookingResources] = useState<Resource[]>([]);

  const [modal, setModal] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | number | null>(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  async function api(path: string, options: RequestInit = {}) {
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
      cache: "no-store",
    });
    const text = await response.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) throw new Error(data?.message || `Request failed (${response.status})`);
    return data;
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoginLoading(true); setError("");
    try {
      const response = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("campusflow_token", data.accessToken);
      setToken(data.accessToken); setUser(data.user || null);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to login"); }
    finally { setLoginLoading(false); }
  }

  function logout() {
    localStorage.removeItem("campusflow_token");
    setToken(null); setUser(null); setStats({}); setStudents([]); setBookings([]); setModal(null);
  }

  async function refreshDashboard() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [overview, me] = await Promise.all([api("/dashboard/overview"), api("/users/me")]);
      setStats(overview || {}); setUser(me || user);
      const [studentData, bookingData] = await Promise.all([api("/academic/students"), api("/bookings")]);
      setStudents(Array.isArray(studentData) ? studentData : studentData?.data || []);
      setBookings(Array.isArray(bookingData) ? bookingData : bookingData?.data || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load dashboard"); }
    finally { setLoading(false); }
  }

  async function loadPageData(next: Page) {
    if (!token) return;
    setError("");
    try {
      if (next === "students") {
        const data = await api("/academic/students");
        setStudents(Array.isArray(data) ? data : data?.data || []);
      }
      if (next === "academics") {
        const [d, c, s] = await Promise.all([api("/academic/departments"), api("/academic/courses"), api("/academic/subjects")]);
        setDepartments(Array.isArray(d) ? d : []); setCourses(Array.isArray(c) ? c : []); setSubjects(Array.isArray(s) ? s : []);
      }
      if (next === "facilities") {
        const [b, r, rs] = await Promise.all([api("/facilities/buildings"), api("/facilities/rooms"), api("/facilities/resources")]);
        setBuildings(Array.isArray(b) ? b : []); setRooms(Array.isArray(r) ? r : []); setResources(Array.isArray(rs) ? rs : []);
      }
      if (next === "bookings") {
        const [b, rs] = await Promise.all([api("/bookings"), api("/facilities/resources")]);
        setBookings(Array.isArray(b) ? b : []); setBookingResources(Array.isArray(rs) ? rs : []);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this section"); }
  }

  useEffect(() => {
    const saved = localStorage.getItem("campusflow_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => { if (token) refreshDashboard(); }, [token]);

  function navigate(next: Page) {
    setPage(next); setMobileMenu(false); setNotice(""); setError("");
    loadPageData(next);
  }

  async function runAction(id: string | number, fn: () => Promise<void>) {
    setActionId(id); setError("");
    try { await fn(); setNotice("Action completed successfully."); await refreshDashboard(); if (page !== "dashboard") await loadPageData(page); }
    catch (e) { setError(e instanceof Error ? e.message : "Action failed"); }
    finally { setActionId(null); }
  }

  async function openStudent(id: string) {
    try { setSelectedStudent(await api(`/academic/students/${id}`)); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load student"); }
  }

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return [s.user?.firstName, s.user?.lastName, s.user?.email, s.rollNumber, s.registrationNo, s.course?.name, s.course?.code, s.currentSemester].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  async function createDepartment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("department", async () => { await api("/academic/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.get("name"), code: f.get("code"), description: f.get("description") || undefined }) }); setModal(null); await loadPageData("academics"); });
  }

  async function createCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("course", async () => { await api("/academic/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ departmentId: Number(f.get("departmentId")), name: f.get("name"), code: f.get("code"), duration: Number(f.get("duration")) }) }); setModal(null); await loadPageData("academics"); });
  }

  async function createSubject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("subject", async () => { await api("/academic/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: Number(f.get("courseId")), name: f.get("name"), code: f.get("code"), credits: Number(f.get("credits")), semester: f.get("semester"), description: f.get("description") || undefined }) }); setModal(null); await loadPageData("academics"); });
  }

  async function createBuilding(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("building", async () => { await api("/facilities/buildings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.get("name"), code: f.get("code"), description: f.get("description") || undefined, address: f.get("address") || undefined }) }); setModal(null); await loadPageData("facilities"); });
  }

  async function createFloor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const id = Number(f.get("buildingId"));
    await runAction("floor", async () => { await api(`/facilities/buildings/${id}/floors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ floorNumber: Number(f.get("floorNumber")), name: f.get("name") || undefined }) }); setModal(null); await loadPageData("facilities"); });
  }

  async function createResource(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("resource", async () => { await api("/facilities/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId: Number(f.get("roomId")), name: f.get("name"), type: f.get("type"), serialNumber: f.get("serialNumber") || undefined, description: f.get("description") || undefined }) }); setModal(null); await loadPageData("facilities"); });
  }

  async function createBooking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("booking", async () => { await api("/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId: Number(f.get("resourceId")), startTime: new Date(String(f.get("startTime"))).toISOString(), endTime: new Date(String(f.get("endTime"))).toISOString(), purpose: f.get("purpose") }) }); setModal(null); await loadPageData("bookings"); });
  }

  async function createAttendanceSession(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    await runAction("attendance", async () => { await api("/attendance/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subjectId: Number(f.get("subjectId")), sessionDate: f.get("sessionDate"), topic: f.get("topic") || undefined }) }); setModal(null); });
  }

  async function loadAttendance(id: string) {
    setAttendanceStudent(id); setAttendanceRecords([]);
    try { const data = await api(`/attendance/student/${id}`); setAttendanceRecords(Array.isArray(data) ? data : []); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load attendance"); }
  }

  if (!token) {
    return <main className="min-h-screen bg-[#06101d] px-5 py-16 text-white"><div className="mx-auto max-w-md"><div className="mb-8 text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-black">C</div><h1 className="text-4xl font-bold">CampusFlow</h1><p className="mt-2 text-slate-400">Smart Campus Management Platform</p></div><form onSubmit={login} className="rounded-3xl border border-white/10 bg-white/[0.05] p-8"><h2 className="text-xl font-semibold">Welcome back</h2><p className="mb-7 mt-1 text-sm text-slate-400">Sign in to manage your campus</p><Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="input" /></Field><Field label="Password"><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="input" /></Field>{error && <Alert text={error} danger /> }<button disabled={loginLoading} className="w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50">{loginLoading ? "Signing in..." : "Sign in"}</button></form></div></main>;
  }

  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard], ["students", "Students", Users], ["academics", "Academics", BookOpen], ["attendance", "Attendance", ClipboardCheck], ["facilities", "Facilities", Building2], ["bookings", "Bookings", CalendarDays],
  ] as const;

  const cards = [
    ["Students", stats.students || 0, Users, "students" as Page], ["Courses", stats.courses || 0, BookOpen, "academics" as Page], ["Rooms", stats.rooms || 0, DoorOpen, "facilities" as Page], ["Resources", stats.resources || 0, Monitor, "facilities" as Page], ["Bookings", stats.bookings || 0, CalendarDays, "bookings" as Page], ["Attendance", stats.attendanceSessions || 0, ClipboardCheck, "attendance" as Page],
  ] as const;

  return <main className="min-h-screen bg-[#06101d] text-white">
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#091525]/95 px-5 py-4 backdrop-blur lg:hidden"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold">C</div><b>CampusFlow</b></div><button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-lg p-2 hover:bg-white/10">{mobileMenu ? <X /> : <Menu />}</button></div>
    {mobileMenu && <div className="fixed inset-0 z-30 bg-[#091525] pt-20 lg:hidden"><nav className="space-y-2 p-5">{nav.map(([id, label, Icon]) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 ${page === id ? "bg-blue-600" : "text-slate-400 hover:bg-white/5"}`}><Icon size={19} />{label}</button>)}</nav></div>}
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#091525] p-5 lg:block"><div className="flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">C</div><div><b>CampusFlow</b><div className="text-xs text-slate-500">Campus Management</div></div></div><nav className="mt-10 space-y-2">{nav.map(([id, label, Icon]) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${page === id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{label}</button>)}</nav><div className="mt-12 border-t border-white/10 pt-5"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><LogOut size={18} />Sign out</button></div></aside>
      <section className="min-w-0 flex-1"><header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10"><div><div className="text-xs uppercase tracking-widest text-blue-400">CampusFlow</div><h1 className="mt-1 text-xl font-bold capitalize">{page}</h1></div><div className="flex items-center gap-3"><button onClick={refreshDashboard} title="Refresh live data" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button><div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user?.firstName} {user?.lastName}</div><div className="text-xs text-slate-500">{user?.roles?.join(", ")}</div></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">{user?.firstName?.[0] || "A"}</div></div></header>
        <div className="p-6 lg:p-10">{error && <Alert text={error} danger />}{notice && <Alert text={notice} />}
          {page === "dashboard" && <Dashboard stats={stats} cards={cards} navigate={navigate} bookings={bookings} />}
          {page === "students" && <Students students={filteredStudents} search={studentSearch} setSearch={setStudentSearch} onOpen={openStudent} />}
          {page === "academics" && <Academics tab={academicTab} setTab={setAcademicTab} departments={departments} courses={courses} subjects={subjects} openModal={setModal} />}
          {page === "attendance" && <Attendance students={students} subjects={subjects} selected={attendanceStudent} records={attendanceRecords} onStudent={loadAttendance} openModal={setModal} />}
          {page === "facilities" && <Facilities tab={facilityTab} setTab={setFacilityTab} buildings={buildings} rooms={rooms} resources={resources} openModal={setModal} />}
          {page === "bookings" && <Bookings bookings={bookings} resources={bookingResources} actionId={actionId} openModal={setModal} runAction={runAction} />}
        </div>
      </section>
    </div>

    {selectedStudent && <Modal title="Student details" close={() => setSelectedStudent(null)}><div className="grid gap-4 sm:grid-cols-2">{[["Name", `${selectedStudent.user?.firstName || ""} ${selectedStudent.user?.lastName || ""}`],["Email", selectedStudent.user?.email],["Roll number", selectedStudent.rollNumber],["Registration", selectedStudent.registrationNo],["Course", selectedStudent.course?.name],["Semester", selectedStudent.currentSemester]].map(([a,b]) => <div key={a} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs uppercase text-slate-500">{a}</div><div className="mt-1 font-medium">{b || "ΓÇö"}</div></div>)}</div>{selectedStudent.enrollments?.length > 0 && <div className="mt-6"><h3 className="font-semibold">Enrollments</h3><div className="mt-3 space-y-2">{selectedStudent.enrollments.map((e: any) => <div key={e.id} className="flex justify-between rounded-xl border border-white/10 p-3 text-sm"><span>{e.subject?.name}</span><span className="text-slate-500">{e.status}</span></div>)}</div></div>}</Modal>}

    {modal === "department" && <Modal title="Add department" close={() => setModal(null)}><form onSubmit={createDepartment} className="space-y-4"><Field label="Name"><input name="name" required className="input" /></Field><Field label="Code"><input name="code" required className="input" /></Field><Field label="Description"><textarea name="description" className="input min-h-24" /></Field><Submit /></form></Modal>}
    {modal === "course" && <Modal title="Add course" close={() => setModal(null)}><form onSubmit={createCourse} className="space-y-4"><SelectField label="Department" name="departmentId" options={departments.map(d => [d.id, `${d.code} ΓÇö ${d.name}`])} /><Field label="Name"><input name="name" required className="input" /></Field><Field label="Code"><input name="code" required className="input" /></Field><Field label="Duration (years)"><input name="duration" type="number" min="1" defaultValue="4" required className="input" /></Field><Submit /></form></Modal>}
    {modal === "subject" && <Modal title="Add subject" close={() => setModal(null)}><form onSubmit={createSubject} className="space-y-4"><SelectField label="Course" name="courseId" options={courses.map(c => [c.id, `${c.code} ΓÇö ${c.name}`])} /><Field label="Name"><input name="name" required className="input" /></Field><Field label="Code"><input name="code" required className="input" /></Field><div className="grid grid-cols-2 gap-4"><Field label="Credits"><input name="credits" type="number" min="1" defaultValue="4" required className="input" /></Field><SelectField label="Semester" name="semester" options={semesters.map(s => [s, s.replace("SEMESTER_", "Semester ")])} /></div><Field label="Description"><textarea name="description" className="input min-h-20" /></Field><Submit /></form></Modal>}
    {modal === "building" && <Modal title="Add building" close={() => setModal(null)}><form onSubmit={createBuilding} className="space-y-4"><Field label="Name"><input name="name" required className="input" /></Field><Field label="Code"><input name="code" required className="input" /></Field><Field label="Address"><input name="address" className="input" /></Field><Field label="Description"><textarea name="description" className="input min-h-20" /></Field><Submit /></form></Modal>}
    {modal === "floor" && <Modal title="Add floor" close={() => setModal(null)}><form onSubmit={createFloor} className="space-y-4"><SelectField label="Building" name="buildingId" options={buildings.map(b => [b.id, `${b.code} ΓÇö ${b.name}`])} /><Field label="Floor number"><input name="floorNumber" type="number" required className="input" /></Field><Field label="Floor name"><input name="name" className="input" placeholder="Ground Floor" /></Field><Submit /></form></Modal>}
    {modal === "resource" && <Modal title="Add resource" close={() => setModal(null)}><form onSubmit={createResource} className="space-y-4"><SelectField label="Room" name="roomId" options={rooms.map(r => [r.id, `${r.roomNumber} ΓÇö ${r.name}`])} /><Field label="Name"><input name="name" required className="input" /></Field><SelectField label="Type" name="type" options={resourceTypes.map(t => [t,t.replaceAll("_", " ")])} /><Field label="Serial number"><input name="serialNumber" className="input" /></Field><Field label="Description"><textarea name="description" className="input min-h-20" /></Field><Submit /></form></Modal>}
    {modal === "booking" && <Modal title="Create booking" close={() => setModal(null)}><form onSubmit={createBooking} className="space-y-4"><SelectField label="Resource" name="resourceId" options={bookingResources.filter(r => r.status === "AVAILABLE").map(r => [r.id, `${r.name} ΓÇö ${r.room?.roomNumber || "Room"}`])} /><Field label="Start"><input name="startTime" type="datetime-local" required className="input" /></Field><Field label="End"><input name="endTime" type="datetime-local" required className="input" /></Field><Field label="Purpose"><textarea name="purpose" required minLength={5} className="input min-h-20" /></Field><Submit /></form></Modal>}
    {modal === "attendance" && <Modal title="Create attendance session" close={() => setModal(null)}><form onSubmit={createAttendanceSession} className="space-y-4"><SelectField label="Subject" name="subjectId" options={subjects.map(s => [s.id, `${s.code} ΓÇö ${s.name}`])} /><Field label="Session date"><input name="sessionDate" type="date" required className="input" /></Field><Field label="Topic"><input name="topic" className="input" /></Field><Submit /></form></Modal>}
  </main>;
}

function Dashboard({ stats, cards, navigate, bookings }: any) {
  return <div><div className="mb-8"><p className="text-sm text-slate-500">Overview</p><h2 className="mt-1 text-3xl font-bold">Good to see you ≡ƒæï</h2><p className="mt-2 text-slate-400">Everything here is connected to your CampusFlow API.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title,value,Icon,target]: any) => <button key={title} onClick={() => navigate(target)} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.07]"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Icon size={21}/></div><ChevronRight className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400" size={18}/></div><div className="mt-6 text-3xl font-bold">{value}</div><div className="mt-1 text-sm text-slate-400">{title}</div></button>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-2"><button onClick={() => navigate("bookings")} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left hover:bg-white/[0.06]"><h3 className="font-semibold">Booking overview</h3><div className="mt-5 grid grid-cols-2 gap-4"><Metric icon={Clock3} value={stats.pendingBookings || 0} label="Pending" /><Metric icon={CheckCircle2} value={stats.approvedBookings || 0} label="Approved" /></div></button><button onClick={() => navigate("facilities")} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left hover:bg-white/[0.06]"><h3 className="font-semibold">Campus availability</h3><div className="mt-5 grid grid-cols-2 gap-4"><Metric icon={DoorOpen} value={stats.availableRooms || 0} label="Available rooms" /><Metric icon={Monitor} value={stats.availableResources || 0} label="Available resources" /></div></button></div><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6"><div className="flex items-center justify-between"><h3 className="font-semibold">Recent bookings</h3><button onClick={() => navigate("bookings")} className="text-sm text-blue-400 hover:text-blue-300">View all</button></div><div className="mt-4 space-y-2">{bookings.slice(0,5).map((b:any)=><div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4"><div><div className="font-medium">{b.purpose}</div><div className="text-xs text-slate-500">{b.resource?.name || "Resource"} ┬╖ {b.startTime ? new Date(b.startTime).toLocaleString() : ""}</div></div><Status value={b.status}/></div>)}{!bookings.length && <Empty text="No bookings yet."/>}</div></div></div>;
}

function Students({ students, search, setSearch, onOpen }: any) { return <div><PageHead title="Students" subtitle="Search and inspect real student records from the database." action={<div className="relative w-full md:w-80"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search students..." className="input pl-10"/></div>}/><div className="mb-4 text-sm text-slate-500">{students.length} result{students.length===1?"":"s"}</div><div className="overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left"><thead className="bg-white/[0.03] text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">Roll</th><th className="px-5 py-4">Course</th><th className="px-5 py-4">Semester</th><th/></tr></thead><tbody>{students.map((s:any)=><tr key={s.id} onClick={()=>onOpen(s.id)} className="cursor-pointer border-t border-white/5 hover:bg-white/[0.04]"><td className="px-5 py-4"><div className="font-medium">{s.user?.firstName} {s.user?.lastName}</div><div className="text-xs text-slate-500">{s.user?.email}</div></td><td className="px-5 py-4 text-sm">{s.rollNumber}</td><td className="px-5 py-4 text-sm text-slate-300">{s.course?.name || "ΓÇö"}</td><td className="px-5 py-4"><span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">{s.currentSemester}</span></td><td className="px-5 py-4"><ChevronRight size={17} className="text-slate-600"/></td></tr>)}</tbody></table>{!students.length&&<Empty text="No students match your search."/>}</div></div>; }

function Academics({ tab, setTab, departments, courses, subjects, openModal }: any) { const tabs:[AcademicTab,string][]=[["departments","Departments"],["courses","Courses"],["subjects","Subjects"]]; return <div><PageHead title="Academics" subtitle="Create and inspect departments, courses and subjects." action={<button onClick={()=>openModal(tab.slice(0,-1))} className="btn"><Plus size={17}/> Add {tab.slice(0,-1)}</button>}/><div className="mb-5 flex gap-2 rounded-xl bg-white/[0.03] p-1">{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-lg px-4 py-2 text-sm ${tab===id?"bg-blue-600":"text-slate-400 hover:text-white"}`}>{label}</button>)}</div>{tab==="departments"&&<DataTable headers={["Code","Department","Courses"]} rows={departments.map((d:any)=>[d.code,d.name,d.courses?.length||0])}/>} {tab==="courses"&&<DataTable headers={["Code","Course","Department","Duration"]} rows={courses.map((c:any)=>[c.code,c.name,c.department?.name||"ΓÇö",`${c.duration} years`])}/>} {tab==="subjects"&&<DataTable headers={["Code","Subject","Course","Semester","Credits"]} rows={subjects.map((s:any)=>[s.code,s.name,s.course?.name||"ΓÇö",s.semester,s.credits])}/>}</div>; }

function Attendance({ students, subjects, selected, records, onStudent, openModal }: any) { return <div><PageHead title="Attendance" subtitle="Create attendance sessions and inspect a student's attendance history." action={<button onClick={()=>openModal("attendance")} className="btn"><Plus size={17}/> Create session</button>}/><div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h3 className="font-semibold">Student attendance</h3><select value={selected} onChange={(e)=>onStudent(e.target.value)} className="input mt-4"><option value="">Select student</option>{students.map((s:any)=><option key={s.id} value={s.id}>{s.user?.firstName} {s.user?.lastName} ΓÇö {s.rollNumber}</option>)}</select></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h3 className="font-semibold">Attendance records</h3>{records.length?<div className="mt-4 space-y-2">{records.map((r:any,i:number)=><div key={r.id||i} className="flex justify-between rounded-xl border border-white/10 p-4"><span>{r.session?.subject?.name || r.subject?.name || `Session ${i+1}`}</span><Status value={r.status}/></div>)}</div>:<Empty text={selected?"No attendance records found.":"Select a student to inspect records."}/>}</div></div><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h3 className="font-semibold">Subjects available for sessions</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{subjects.map((s:any)=><div key={s.id} className="rounded-xl border border-white/10 p-4"><div className="text-xs text-blue-400">{s.code}</div><div className="mt-1 font-medium">{s.name}</div><div className="mt-1 text-xs text-slate-500">{s.semester} ┬╖ {s.credits} credits</div></div>)}</div></div></div>; }

function Facilities({ tab, setTab, buildings, rooms, resources, openModal }: any) { const tabs:[FacilityTab,string][]=[["buildings","Buildings"],["rooms","Rooms"],["resources","Resources"]]; return <div><PageHead title="Facilities" subtitle="Manage campus infrastructure instead of viewing static cards." action={<div className="flex gap-2"><button onClick={()=>openModal(tab==="buildings"?"building":tab==="resources"?"resource":"floor")} className="btn"><Plus size={17}/> Add {tab==="buildings"?"building":tab==="resources"?"resource":"floor"}</button></div>}/><div className="mb-5 flex gap-2 rounded-xl bg-white/[0.03] p-1">{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-lg px-4 py-2 text-sm ${tab===id?"bg-blue-600":"text-slate-400 hover:text-white"}`}>{label}</button>)}</div>{tab==="buildings"&&<DataTable headers={["Code","Building","Floors","Address"]} rows={buildings.map((b:any)=>[b.code,b.name,b.floors?.length||0,b.address||"ΓÇö"])}/>} {tab==="rooms"&&<DataTable headers={["Room","Name","Type","Capacity","Status"]} rows={rooms.map((r:any)=>[r.roomNumber,r.name,r.type,r.capacity,r.status])}/>} {tab==="resources"&&<DataTable headers={["Resource","Type","Room","Status","Serial"]} rows={resources.map((r:any)=>[r.name,r.type,r.room?.roomNumber||"ΓÇö",r.status,r.serialNumber||"ΓÇö"])}/>}</div>; }

function Bookings({ bookings, resources, actionId, openModal, runAction }: any) { return <div><PageHead title="Bookings" subtitle="Create requests and approve, reject or cancel them from the live backend." action={<button onClick={()=>openModal("booking")} className="btn"><Plus size={17}/> New booking</button>}/><div className="grid gap-4 sm:grid-cols-3"><Metric icon={Clock3} value={bookings.filter((b:any)=>b.status==="PENDING").length} label="Pending"/><Metric icon={CheckCircle2} value={bookings.filter((b:any)=>b.status==="APPROVED").length} label="Approved"/><Metric icon={CalendarDays} value={bookings.length} label="Total"/></div><div className="mt-6 space-y-3">{bookings.map((b:any)=><div key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">{b.purpose}</div><div className="mt-1 text-sm text-slate-400">{b.resource?.name||`Resource #${b.resourceId}`} ┬╖ {b.startTime?new Date(b.startTime).toLocaleString():""}</div><div className="mt-1 text-xs text-slate-600">{b.endTime?new Date(b.endTime).toLocaleString():""}</div></div><div className="flex items-center gap-2"><Status value={b.status}/>{b.status==="PENDING"&&<><button disabled={actionId===b.id} onClick={()=>runAction(b.id,async()=>{await fetch(`${API}/bookings/${b.id}/approve`,{method:"POST",headers:{Authorization:`Bearer ${localStorage.getItem("campusflow_token")}`}})})} className="iconbtn text-emerald-400"><Check size={17}/></button><button disabled={actionId===b.id} onClick={()=>runAction(b.id,async()=>{await fetch(`${API}/bookings/${b.id}/reject`,{method:"POST",headers:{Authorization:`Bearer ${localStorage.getItem("campusflow_token")}`}})})} className="iconbtn text-red-400"><XCircle size={17}/></button></>}</div></div></div>)}{!bookings.length&&<Empty text="No bookings available."/>}</div></div>; }

function PageHead({title,subtitle,action}:any){return <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-blue-400">CampusFlow</p><h2 className="mt-1 text-3xl font-bold">{title}</h2><p className="mt-2 text-slate-400">{subtitle}</p></div>{action}</div>}
function Metric({icon:Icon,value,label}:any){return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Icon size={19} className="text-blue-400"/><div className="mt-4 text-3xl font-bold">{value}</div><div className="text-sm text-slate-500">{label}</div></div>}
function Status({value}:any){const c=value==="APPROVED"||value==="AVAILABLE"||value==="PRESENT"?"bg-emerald-500/10 text-emerald-400":value==="REJECTED"||value==="CANCELLED"||value==="ABSENT"?"bg-red-500/10 text-red-400":"bg-yellow-500/10 text-yellow-400";return <span className={`rounded-lg px-2.5 py-1 text-xs ${c}`}>{value}</span>}
function DataTable({headers,rows}:any){return <div className="overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left"><thead className="bg-white/[0.03] text-xs uppercase text-slate-500"><tr>{headers.map((h:string)=><th key={h} className="px-5 py-4">{h}</th>)}</tr></thead><tbody>{rows.map((r:any[],i:number)=><tr key={i} className="border-t border-white/5 hover:bg-white/[0.03]">{r.map((v:any,j:number)=><td key={j} className="px-5 py-4 text-sm text-slate-300">{j===r.length-1&&typeof v==="string"&&["AVAILABLE","OCCUPIED","BOOKED","MAINTENANCE","RESTRICTED"].includes(v)?<Status value={v}/>:v}</td>)}</tr>)}</tbody></table>{!rows.length&&<Empty text="No records found."/>}</div>}
function Empty({text}:any){return <div className="p-10 text-center text-sm text-slate-500"><Activity className="mx-auto mb-3 text-slate-700" size={28}/>{text}</div>}
function Alert({text,danger=false}:any){return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${danger?"border-red-500/20 bg-red-500/10 text-red-300":"border-emerald-500/20 bg-emerald-500/10 text-emerald-300"}`}>{text}</div>}
function Field({label,children}:any){return <label className="block text-sm text-slate-300"><span className="mb-2 block">{label}</span>{children}</label>}
function SelectField({label,name,options}:any){return <Field label={label}><select name={name} required className="input"><option value="">Select...</option>{options.map(([v,l]:any)=><option key={v} value={v}>{l}</option>)}</select></Field>}
function Submit(){return <button className="btn w-full justify-center bg-blue-600 hover:bg-blue-500"><Plus size={17}/>Save</button>}
function Modal({title,close,children}:any){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1728] p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18}/></button></div>{children}</div></div>}

