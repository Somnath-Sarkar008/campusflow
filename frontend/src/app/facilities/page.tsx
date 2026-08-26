"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Room = {
  id: number;
  name: string;
  roomNumber: string;
  type: string;
  capacity: number;
  status: string;
  floor?: {
    floorNumber: number;
    name?: string;
    building?: {
      name: string;
      code: string;
    };
  };
  resources?: Resource[];
};

type Resource = {
  id: number;
  name: string;
  type: string;
  status: string;
  serialNumber?: string;
};

export default function FacilitiesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacilities();
  }, []);

  async function loadFacilities() {
    try {
      const [roomsRes, resourcesRes] = await Promise.all([
        api.get("/facilities/rooms"),
        api.get("/facilities/resources"),
      ]);

      setRooms(
        Array.isArray(roomsRes.data) ? roomsRes.data : [],
      );

      setResources(
        Array.isArray(resourcesRes.data)
          ? resourcesRes.data
          : [],
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold">
            Campus Facilities
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Rooms and campus resources
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Stat
            title="Rooms"
            value={rooms.length}
          />

          <Stat
            title="Resources"
            value={resources.length}
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Campus Rooms
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading facilities...
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No rooms found.
            </div>
          ) : (
            <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {room.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Room {room.roomNumber}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                      {room.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-900 p-3">
                      <p className="text-slate-500">
                        Type
                      </p>
                      <p className="mt-1">
                        {room.type}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-3">
                      <p className="text-slate-500">
                        Capacity
                      </p>
                      <p className="mt-1">
                        {room.capacity}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    {room.floor?.building?.name ||
                      "Building"}{" "}
                    • Floor{" "}
                    {room.floor?.floorNumber ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Campus Resources
            </h2>
          </div>

          {resources.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No resources found.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium">
                      {resource.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {resource.type}
                      {resource.serialNumber
                        ? ` • ${resource.serialNumber}`
                        : ""}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400">
                    {resource.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}