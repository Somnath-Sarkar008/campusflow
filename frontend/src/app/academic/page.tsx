"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Department = {
  id: number;
  name: string;
  code: string;
  description?: string;
};

type Course = {
  id: number;
  name: string;
  code: string;
  duration: number;
  department?: Department;
};

type Subject = {
  id: number;
  name: string;
  code: string;
  credits: number;
  semester: string;
  course?: Course;
};

export default function AcademicPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("departments");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    try {
      const [departmentsRes, coursesRes, subjectsRes] =
        await Promise.all([
          api.get("/academic/departments"),
          api.get("/academic/courses"),
          api.get("/academic/subjects"),
        ]);

      setDepartments(
        Array.isArray(departmentsRes.data)
          ? departmentsRes.data
          : [],
      );

      setCourses(
        Array.isArray(coursesRes.data)
          ? coursesRes.data
          : [],
      );

      setSubjects(
        Array.isArray(subjectsRes.data)
          ? subjectsRes.data
          : [],
      );
    } catch (error) {
      console.error("Failed to load academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold">
            Academic Management
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage departments, courses and subjects
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryCard
            title="Departments"
            value={departments.length}
          />

          <SummaryCard
            title="Courses"
            value={courses.length}
          />

          <SummaryCard
            title="Subjects"
            value={subjects.length}
          />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-2">
          {[
            ["departments", "Departments"],
            ["courses", "Courses"],
            ["subjects", "Subjects"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              Loading academic data...
            </div>
          ) : (
            <>
              {activeTab === "departments" && (
                <DepartmentsTable
                  departments={departments}
                />
              )}

              {activeTab === "courses" && (
                <CoursesTable courses={courses} />
              )}

              {activeTab === "subjects" && (
                <SubjectsTable subjects={subjects} />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function DepartmentsTable({
  departments,
}: {
  departments: Department[];
}) {
  return (
    <DataContainer title="Departments">
      {departments.length === 0 ? (
        <EmptyState text="No departments found." />
      ) : (
        <div className="divide-y divide-slate-800">
          {departments.map((department) => (
            <div
              key={department.id}
              className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">
                  {department.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {department.description || "No description"}
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
                {department.code}
              </span>
            </div>
          ))}
        </div>
      )}
    </DataContainer>
  );
}

function CoursesTable({
  courses,
}: {
  courses: Course[];
}) {
  return (
    <DataContainer title="Courses">
      {courses.length === 0 ? (
        <EmptyState text="No courses found." />
      ) : (
        <div className="divide-y divide-slate-800">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">
                  {course.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {course.department?.name ||
                    "Department unavailable"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">
                  {course.code}
                </span>

                <span className="rounded-full bg-slate-800 px-4 py-1.5 text-sm text-slate-300">
                  {course.duration} Years
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DataContainer>
  );
}

function SubjectsTable({
  subjects,
}: {
  subjects: Subject[];
}) {
  return (
    <DataContainer title="Subjects">
      {subjects.length === 0 ? (
        <EmptyState text="No subjects found." />
      ) : (
        <div className="divide-y divide-slate-800">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">
                  {subject.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {subject.course?.name ||
                    "Course unavailable"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-green-500/10 px-3 py-1.5 text-sm text-green-400">
                  {subject.code}
                </span>

                <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400">
                  {subject.credits} Credits
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                  {subject.semester.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DataContainer>
  );
}

function DataContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-6 py-12 text-center text-slate-500">
      {text}
    </div>
  );
}