
"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import { Calendar, Sparkles } from "lucide-react";

export default function CreateEventTab({
  onEventCreated,
}: {
  onEventCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // async function handleCreateEvent() {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     setSuccess("");

  //     const token = getToken();

  //     const res = await fetch("/api/events/create", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         token,
  //         title,
  //         description,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.error || "Failed to create event");
  //     }

  //     setSuccess("Event created successfully");
  //     setTitle("");
  //     setDescription("");

  //     onEventCreated?.();
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  
  async function handleCreateEvent() {
  try {
    setLoading(true);
    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {
      throw new Error("Not logged in");
    }

    const res = await fetch("/api/events/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ FIX
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create event");
    }

    setSuccess("Event created successfully");
    setTitle("");
    setDescription("");

    onEventCreated?.();

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="max-w-2xl">
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Create Event
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Create a new event to manage groups and photos
        </p>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-5">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Event Title */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-800">
            Event Title *
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Riya Wedding"
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none transition"
          />
        </div>

        {/* Description */}
        <div className="mb-7">
          <label className="text-sm font-semibold text-gray-800">
            Description
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description about this event..."
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none transition resize-none"
          />
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Event will be created instantly
          </div>

          <button
            onClick={handleCreateEvent}
            disabled={loading || !title}
            className="bg-[#0f766e] hover:bg-[#0d5f59] text-white px-6 py-3 rounded-xl font-semibold disabled:bg-gray-400 transition"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
