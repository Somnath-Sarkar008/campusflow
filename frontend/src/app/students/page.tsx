"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const response = await api.get("/academic/students");
      setStudents(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter((student) => {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  const searchableText = [
    student.user?.firstName ?? "",
    student.user?.lastName ?? "",
    student.user?.email ?? "",
    student.rollNumber ?? "",
    student.registrationNo ?? "",
    student.course?.name ?? "",
    student.course?.code ?? "",
    student.currentSemester ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
});

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage registered students
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Total Students
            </p>
            <p className="text-3xl font-bold">
              {students.length}
            </p>
          </div>

          <input
  type="text"
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
  }}
  placeholder="Search students..."
  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 sm:w-80"
/>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-sm text-slate-400">
                      Student
                    </th>
                    <th className="px-6 py-4 text-sm text-slate-400">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-sm text-slate-400">
                      Registration
                    </th>
                    <th className="px-6 py-4 text-sm text-slate-400">
                      Course
                    </th>
                    <th className="px-6 py-4 text-sm text-slate-400">
                      Semester
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium">
                          {student.user?.firstName}{" "}
                          {student.user?.lastName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {student.user?.email}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {student.rollNumber}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {student.registrationNo}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm">
                          {student.course?.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {student.course?.code}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                          {student.currentSemester}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}