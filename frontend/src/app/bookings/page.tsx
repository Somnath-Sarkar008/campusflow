"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose: string;
  resource?: {
    id: number;
    name: string;
    type: string;
    room?: {
      name: string;
      roomNumber: string;
    };
  };
  user?: {
    firstName: string;
    lastName: string;
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const res = await api.get("/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id: string) {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setMessage("Booking cancelled.");
      loadBookings();
    } catch (error: any) {
      console.error(error);
      setMessage(
        error?.response?.data?.message ||
          "Failed to cancel booking.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage campus resource bookings
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Booking History
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-medium">
                No bookings yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Resource bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">
                      {booking.resource?.name ||
                        "Campus Resource"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {booking.resource?.room?.name ||
                        "Room"}{" "}
                      {booking.resource?.room?.roomNumber
                        ? `• ${booking.resource.room.roomNumber}`
                        : ""}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {booking.purpose}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">
                      {new Date(
                        booking.startTime,
                      ).toLocaleString()}
                    </span>

                    <span
                      className={`rounded-full px-4 py-2 text-sm ${
                        booking.status === "APPROVED"
                          ? "bg-green-500/10 text-green-400"
                          : booking.status === "REJECTED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {booking.status}
                    </span>

                    {booking.status !== "CANCELLED" &&
                      booking.status !== "COMPLETED" && (
                        <button
                          onClick={() =>
                            cancelBooking(booking.id)
                          }
                          className="rounded-lg bg-red-600/10 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}