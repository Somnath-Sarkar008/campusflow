"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Session = {
  id: number;
  sessionDate: string;
  topic: string;
  subject?: {
    name: string;
    code: string;
  };
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

export default function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [subjectId, setSubjectId] = useState("1");
  const [topic, setTopic] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [selectedSession, setSelectedSession] =
    useState<number | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sessionsRes, studentsRes] = await Promise.all([
        api.get("/attendance/sessions"),
        api.get("/academic/students"),
      ]);

      setSessions(
        Array.isArray(sessionsRes.data)
          ? sessionsRes.data
          : [],
      );

      setStudents(
        Array.isArray(studentsRes.data)
          ? studentsRes.data
          : [],
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post(
        "/attendance/sessions",
        {
          subjectId: Number(subjectId),
          sessionDate,
          topic,
        },
      );

      setSessions((prev) => [response.data, ...prev]);

      setTopic("");
      setSelectedSession(response.data.id);

      setMessage("Attendance session created successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(
        error?.response?.data?.message ||
          "Failed to create attendance session.",
      );
    }
  }

  async function markAttendance(
    studentId: string,
    status: "PRESENT" | "ABSENT",
  ) {
    if (!selectedSession) {
      setMessage("Select an attendance session first.");
      return;
    }

    try {
      await api.post(
        `/attendance/sessions/${selectedSession}/records`,
        {
          studentId,
          status,
        },
      );

      setMessage("Attendance updated successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(
        error?.response?.data?.message ||
          "Failed to update attendance.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold">
            Attendance Management
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Create sessions and record student attendance
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Create session */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Create Attendance Session
          </h2>

          <form
            onSubmit={createSession}
            className="mt-6 grid gap-4 md:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Subject ID
              </label>

              <input
                value={subjectId}
                onChange={(e) =>
                  setSubjectId(e.target.value)
                }
                type="number"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Date
              </label>

              <input
                value={sessionDate}
                onChange={(e) =>
                  setSessionDate(e.target.value)
                }
                type="date"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Topic
              </label>

              <input
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
                required
                placeholder="e.g. Introduction to DBMS"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
              >
                Create Session
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
              {message}
            </p>
          )}
        </section>

        {/* Sessions */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[350px_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <h2 className="font-semibold">
                Attendance Sessions
              </h2>
            </div>

            {loading ? (
              <p className="p-5 text-sm text-slate-500">
                Loading...
              </p>
            ) : sessions.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                No sessions found.
              </p>
            ) : (
              <div className="divide-y divide-slate-800">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() =>
                      setSelectedSession(session.id)
                    }
                    className={`w-full p-5 text-left transition ${
                      selectedSession === session.id
                        ? "bg-blue-600/10"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-medium">
                      {session.topic}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {session.subject?.code ||
                        `Subject #${session.subject?.name || session.id}`}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(
                        session.sessionDate,
                      ).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Students */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <h2 className="font-semibold">
                Mark Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSession
                  ? `Session #${selectedSession}`
                  : "Select a session"}
              </p>
            </div>

            {!selectedSession ? (
              <div className="p-10 text-center text-slate-500">
                Select an attendance session to mark students.
              </div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No students found.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {student.user?.firstName}{" "}
                        {student.user?.lastName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {student.rollNumber}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          markAttendance(
                            student.id,
                            "PRESENT",
                          )
                        }
                        className="rounded-lg bg-green-600/15 px-4 py-2 text-sm font-medium text-green-400 transition hover:bg-green-600 hover:text-white"
                      >
                        Present
                      </button>

                      <button
                        onClick={() =>
                          markAttendance(
                            student.id,
                            "ABSENT",
                          )
                        }
                        className="rounded-lg bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600 hover:text-white"
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}