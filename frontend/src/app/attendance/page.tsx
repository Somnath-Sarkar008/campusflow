"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Subject = {
  id: number;
  name: string;
  code: string;
  semester?: string;
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

type Session = {
  id: number;
  sessionDate: string;
  topic: string;
  subject?: {
    id?: number;
    name: string;
    code: string;
  };
  _count?: { records: number };
};

type Student = {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rollNumber: string;
};

type RecordItem = {
  studentId: string;
  status: AttendanceStatus;
};

const statusStyles: Record<AttendanceStatus, string> = {
  PRESENT: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  ABSENT: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  LATE: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  EXCUSED: "border-sky-400/20 bg-sky-400/10 text-sky-300",
};

export default function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sessionsRes, studentsRes, subjectsRes] = await Promise.all([
        api.get("/attendance/sessions"),
        api.get("/academic/students"),
        api.get("/academic/subjects"),
      ]);

      const nextSessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
      const nextSubjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];

      setSessions(nextSessions);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setSubjects(nextSubjects);

      if (nextSubjects.length > 0) {
        setSubjectId(String(nextSubjects[0].id));
      }

      if (nextSessions.length > 0) {
        await selectSession(nextSessions[0].id);
      }
    } catch (error: any) {
      console.error(error);
      setMessage(
        error?.response?.data?.message ||
          "Unable to load attendance data. Please refresh and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function selectSession(sessionId: number) {
    setSelectedSession(sessionId);
    setSessionLoading(true);
    try {
      const response = await api.get(`/attendance/sessions/${sessionId}`);
      const nextRecords: Record<string, AttendanceStatus> = {};

      for (const record of response.data?.records || []) {
        nextRecords[record.studentId] = record.status;
      }

      setRecords(nextRecords);
    } catch (error: any) {
      console.error(error);
      setRecords({});
      setMessage(
        error?.response?.data?.message || "Unable to load this session.",
      );
    } finally {
      setSessionLoading(false);
    }
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!subjectId) {
      setMessage("Please select a subject first.");
      return;
    }

    try {
      const response = await api.post("/attendance/sessions", {
        subjectId: Number(subjectId),
        sessionDate,
        topic,
      });

      const created = response.data as Session;
      setSessions((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      setTopic("");
      setMessage("Attendance session created successfully.");
      await selectSession(created.id);
    } catch (error: any) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || "Failed to create attendance session.",
      );
    }
  }

  async function markAttendance(studentId: string, status: AttendanceStatus) {
    if (!selectedSession) {
      setMessage("Select an attendance session first.");
      return;
    }

    const previous = records[studentId];
    setRecords((prev) => ({ ...prev, [studentId]: status }));
    setMessage("");

    try {
      await api.post(`/attendance/sessions/${selectedSession}/records`, {
        studentId,
        status,
      });

      setSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession
            ? {
                ...session,
                _count: {
                  records: Math.max(
                    session._count?.records || 0,
                    Object.keys(records).length + (previous ? 0 : 1),
                  ),
                },
              }
            : session,
        ),
      );
    } catch (error: any) {
      console.error(error);
      setRecords((prev) => {
        const next = { ...prev };
        if (previous) next[studentId] = previous;
        else delete next[studentId];
        return next;
      });
      setMessage(
        error?.response?.data?.message || "Failed to update attendance.",
      );
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) =>
      `${student.user?.firstName || ""} ${student.user?.lastName || ""} ${student.rollNumber} ${student.user?.email || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [students, search]);

  const counts = useMemo(() => {
    const values = Object.values(records);
    return {
      present: values.filter((value) => value === "PRESENT").length,
      absent: values.filter((value) => value === "ABSENT").length,
      late: values.filter((value) => value === "LATE").length,
      marked: values.length,
    };
  }, [records]);

  const selected = sessions.find((session) => session.id === selectedSession);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Academic Operations
              </p>
              <h1 className="mt-1 text-2xl font-bold">Attendance Management</h1>
              <p className="mt-1 text-sm text-slate-400">
                Create class sessions and record student attendance in real time.
              </p>
            </div>
            {selected && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
                <span className="text-slate-500">Active session</span>{" "}
                <span className="font-semibold text-white">{selected.topic}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/10">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Create Attendance Session</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the actual subject instead of entering an internal database ID.
            </p>
          </div>

          <form onSubmit={createSession} className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-slate-400">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} — {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">Date</label>
              <input
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                type="date"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="e.g. Introduction to DBMS"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!subjects.length}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Session
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              {message}
            </p>
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Attendance Sessions</h2>
                  <p className="mt-1 text-sm text-slate-500">Select a class to mark its register.</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {sessions.length}
                </span>
              </div>
            </div>

            {loading ? (
              <p className="p-5 text-sm text-slate-500">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No sessions found. Create your first session above.
              </p>
            ) : (
              <div className="max-h-[620px] divide-y divide-slate-800 overflow-y-auto">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session.id)}
                    className={`w-full p-5 text-left transition ${
                      selectedSession === session.id
                        ? "bg-blue-600/10 ring-1 ring-inset ring-blue-500/30"
                        : "hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{session.topic}</p>
                        <p className="mt-1 text-sm text-blue-300">
                          {session.subject?.code || "Unknown subject"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(session.sessionDate).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">
                        {session._count?.records || 0} marked
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">Mark Attendance</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selected
                      ? `${selected.subject?.code || "Subject"} · ${selected.topic}`
                      : "Select a session to begin"}
                  </p>
                </div>

                {selectedSession && (
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                      Present {counts.present}
                    </span>
                    <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-rose-300">
                      Absent {counts.absent}
                    </span>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-400">
                      Marked {counts.marked}/{students.length}
                    </span>
                  </div>
                )}
              </div>

              {selectedSession && (
                <div className="mt-4">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student name, roll number or email..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {!selectedSession ? (
              <div className="p-12 text-center text-slate-500">
                Select an attendance session to mark students.
              </div>
            ) : sessionLoading ? (
              <div className="p-12 text-center text-slate-500">Loading attendance...</div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No students found.</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No students match your search.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredStudents.map((student) => {
                  const status = records[student.id];
                  const name = `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim();

                  return (
                    <div
                      key={student.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-white">{name || "Unnamed student"}</p>
                          {status && (
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyles[status]}`}>
                              {status}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {student.rollNumber} · {student.user?.email || "No email"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => markAttendance(student.id, "PRESENT")}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            status === "PRESENT"
                              ? "border-emerald-400/40 bg-emerald-500 text-white"
                              : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, "ABSENT")}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            status === "ABSENT"
                              ? "border-rose-400/40 bg-rose-500 text-white"
                              : "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
