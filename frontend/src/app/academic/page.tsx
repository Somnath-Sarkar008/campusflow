"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";

type Department = { id: number; name: string; code: string; description?: string };
type Course = { id: number; name: string; code: string; duration: number; department?: Department };
type Subject = { id: number; name: string; code: string; credits: number; semester: string; course?: Course };

type Tab = "departments" | "courses" | "subjects";

const semesters = Array.from({ length: 8 }, (_, i) => `SEMESTER_${i + 1}`);

export default function AcademicPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("departments");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [departmentForm, setDepartmentForm] = useState({ name: "", code: "", description: "" });
  const [courseForm, setCourseForm] = useState({ departmentId: "", name: "", code: "", duration: "4" });
  const [subjectForm, setSubjectForm] = useState({ courseId: "", name: "", code: "", credits: "4", semester: "SEMESTER_1", description: "" });

  useEffect(() => { loadAcademicData(); }, []);

  async function loadAcademicData() {
    setLoading(true);
    setError("");
    try {
      const [d, c, s] = await Promise.all([
        api.get("/academic/departments"),
        api.get("/academic/courses"),
        api.get("/academic/subjects"),
      ]);
      setDepartments(Array.isArray(d.data) ? d.data : []);
      setCourses(Array.isArray(c.data) ? c.data : []);
      setSubjects(Array.isArray(s.data) ? s.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not load academic data.");
    } finally { setLoading(false); }
  }

  function openCreate() {
    setError(""); setSuccess(""); setSearch("");
    if (activeTab === "courses" && !courseForm.departmentId && departments[0]) {
      setCourseForm((v) => ({ ...v, departmentId: String(departments[0].id) }));
    }
    if (activeTab === "subjects" && !subjectForm.courseId && courses[0]) {
      setSubjectForm((v) => ({ ...v, courseId: String(courses[0].id) }));
    }
    setShowForm(true);
  }

  async function submitDepartment(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/academic/departments", departmentForm);
      setDepartmentForm({ name: "", code: "", description: "" });
      setSuccess("Department created successfully."); setShowForm(false); await loadAcademicData();
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to create department."); }
    finally { setSaving(false); }
  }

  async function submitCourse(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/academic/courses", { ...courseForm, departmentId: Number(courseForm.departmentId), duration: Number(courseForm.duration) });
      setCourseForm({ departmentId: departments[0] ? String(departments[0].id) : "", name: "", code: "", duration: "4" });
      setSuccess("Course created successfully."); setShowForm(false); await loadAcademicData();
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to create course."); }
    finally { setSaving(false); }
  }

  async function submitSubject(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/academic/subjects", { ...subjectForm, courseId: Number(subjectForm.courseId), credits: Number(subjectForm.credits) });
      setSubjectForm({ courseId: courses[0] ? String(courses[0].id) : "", name: "", code: "", credits: "4", semester: "SEMESTER_1", description: "" });
      setSuccess("Subject created successfully."); setShowForm(false); await loadAcademicData();
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to create subject."); }
    finally { setSaving(false); }
  }

  const q = search.trim().toLowerCase();
  const filteredDepartments = departments.filter(x => `${x.name} ${x.code} ${x.description || ""}`.toLowerCase().includes(q));
  const filteredCourses = courses.filter(x => `${x.name} ${x.code} ${x.department?.name || ""}`.toLowerCase().includes(q));
  const filteredSubjects = subjects.filter(x => `${x.name} ${x.code} ${x.semester} ${x.course?.name || ""}`.toLowerCase().includes(q));

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div><h1 className="text-2xl font-bold">Academic Management</h1><p className="mt-1 text-sm text-slate-400">Manage departments, courses and subjects</p></div>
          <button onClick={loadAcademicData} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Refresh</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{success}</div>}

        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryCard title="Departments" value={departments.length} active={activeTab === "departments"} onClick={() => setActiveTab("departments")} />
          <SummaryCard title="Courses" value={courses.length} active={activeTab === "courses"} onClick={() => setActiveTab("courses")} />
          <SummaryCard title="Subjects" value={subjects.length} active={activeTab === "subjects"} onClick={() => setActiveTab("subjects")} />
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-2">
            {([ ["departments", "Departments"], ["courses", "Courses"], ["subjects", "Subjects"] ] as [Tab,string][]).map(([key,label]) => (
              <button key={key} onClick={() => { setActiveTab(key); setShowForm(false); setSearch(""); }} className={`rounded-lg px-5 py-2.5 text-sm font-medium ${activeTab === key ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-64" />
            <button onClick={openCreate} className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500">+ Add {activeTab === "departments" ? "Department" : activeTab === "courses" ? "Course" : "Subject"}</button>
          </div>
        </div>

        {showForm && <div className="mt-6 rounded-2xl border border-blue-500/20 bg-slate-900 p-6">
          {activeTab === "departments" && <Form title="Add Department" onSubmit={submitDepartment} saving={saving} onCancel={() => setShowForm(false)}>
            <Field label="Name"><input required value={departmentForm.name} onChange={e => setDepartmentForm({...departmentForm,name:e.target.value})} placeholder="Computer Science & Engineering" /></Field>
            <Field label="Code"><input required value={departmentForm.code} onChange={e => setDepartmentForm({...departmentForm,code:e.target.value})} placeholder="CSE" /></Field>
            <Field label="Description"><input value={departmentForm.description} onChange={e => setDepartmentForm({...departmentForm,description:e.target.value})} placeholder="Department description" /></Field>
          </Form>}
          {activeTab === "courses" && <Form title="Add Course" onSubmit={submitCourse} saving={saving} onCancel={() => setShowForm(false)}>
            <Field label="Department"><select required value={courseForm.departmentId} onChange={e => setCourseForm({...courseForm,departmentId:e.target.value})}>{departments.map(d=><option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}</select></Field>
            <Field label="Course Name"><input required value={courseForm.name} onChange={e => setCourseForm({...courseForm,name:e.target.value})} placeholder="B.Tech Computer Science" /></Field>
            <Field label="Code"><input required value={courseForm.code} onChange={e => setCourseForm({...courseForm,code:e.target.value})} placeholder="BTECH-CSE" /></Field>
            <Field label="Duration (years)"><input required type="number" min="1" value={courseForm.duration} onChange={e => setCourseForm({...courseForm,duration:e.target.value})} /></Field>
          </Form>}
          {activeTab === "subjects" && <Form title="Add Subject" onSubmit={submitSubject} saving={saving} onCancel={() => setShowForm(false)}>
            <Field label="Course"><select required value={subjectForm.courseId} onChange={e => setSubjectForm({...subjectForm,courseId:e.target.value})}>{courses.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></Field>
            <Field label="Subject Name"><input required value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm,name:e.target.value})} placeholder="Database Management Systems" /></Field>
            <Field label="Code"><input required value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm,code:e.target.value})} placeholder="PCC-CS601" /></Field>
            <Field label="Credits"><input required type="number" min="1" value={subjectForm.credits} onChange={e => setSubjectForm({...subjectForm,credits:e.target.value})} /></Field>
            <Field label="Semester"><select value={subjectForm.semester} onChange={e => setSubjectForm({...subjectForm,semester:e.target.value})}>{semesters.map(s=><option key={s}>{s}</option>)}</select></Field>
            <Field label="Description"><input value={subjectForm.description} onChange={e => setSubjectForm({...subjectForm,description:e.target.value})} placeholder="Subject description" /></Field>
          </Form>}
        </div>}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? <div className="p-12 text-center text-slate-400">Loading academic data...</div> : activeTab === "departments" ? <DepartmentsTable departments={filteredDepartments} /> : activeTab === "courses" ? <CoursesTable courses={filteredCourses} /> : <SubjectsTable subjects={filteredSubjects} />}
        </div>
      </div>
    </main>
  );
}

function SummaryCard({title,value,active,onClick}:{title:string;value:number;active:boolean;onClick:()=>void}) { return <button onClick={onClick} className={`rounded-2xl border p-6 text-left transition hover:-translate-y-0.5 ${active ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}><p className="text-sm text-slate-400">{title}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-blue-400">Open {title.toLowerCase()} →</p></button>; }

function Form({title,onSubmit,saving,onCancel,children}:{title:string;onSubmit:(e:FormEvent)=>void;saving:boolean;onCancel:()=>void;children:React.ReactNode}) { return <form onSubmit={onSubmit}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button type="button" onClick={onCancel} className="text-slate-400 hover:text-white">Cancel</button></div><div className="grid gap-4 md:grid-cols-2">{children}</div><div className="mt-6 flex justify-end"><button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button></div></form>; }

function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block text-sm"><span className="mb-2 block text-slate-300">{label}</span>{children}</label>; }

const inputClass = "mt-0 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-blue-500";

function DepartmentsTable({departments}:{departments:Department[]}) { return departments.length===0 ? <EmptyState text="No departments found." /> : <div className="divide-y divide-slate-800">{departments.map(d=><div key={d.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/30"><div><h3 className="font-semibold">{d.name}</h3><p className="mt-1 text-sm text-slate-500">{d.description || "No description"}</p></div><span className="rounded-full bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">{d.code}</span></div>)}</div>; }
function CoursesTable({courses}:{courses:Course[]}) { return courses.length===0 ? <EmptyState text="No courses found." /> : <div className="divide-y divide-slate-800">{courses.map(c=><div key={c.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/30"><div><h3 className="font-semibold">{c.name}</h3><p className="mt-1 text-sm text-slate-500">{c.department?.name || "Department unavailable"}</p></div><div className="flex gap-3"><span className="rounded-full bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">{c.code}</span><span className="rounded-full bg-slate-800 px-4 py-1.5 text-sm text-slate-300">{c.duration} Years</span></div></div>)}</div>; }
function SubjectsTable({subjects}:{subjects:Subject[]}) { return subjects.length===0 ? <EmptyState text="No subjects found." /> : <div className="divide-y divide-slate-800">{subjects.map(s=><div key={s.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/30"><div><h3 className="font-semibold">{s.name}</h3><p className="mt-1 text-sm text-slate-500">{s.course?.name || "Course unavailable"}</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-green-500/10 px-3 py-1.5 text-sm text-green-400">{s.code}</span><span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400">{s.credits} Credits</span><span className="rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-300">{s.semester.replace("_", " ")}</span></div></div>)}</div>; }
function EmptyState({text}:{text:string}) { return <div className="px-6 py-12 text-center text-slate-500">{text}</div>; }

// Apply shared input styling without repeating long Tailwind strings in every field.
if (typeof document !== "undefined") {
  // no-op: inputs receive their classes through the global CSS selector below
}
