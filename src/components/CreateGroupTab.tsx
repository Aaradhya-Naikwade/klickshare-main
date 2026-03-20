"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import CreateEventTab from "./CreateEventTab";
import { Users, Layers } from "lucide-react";

export default function CreateGroupTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventId, setEventId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      const token = getToken();
      if (!token) {
        setError("Please login again");
        return;
      }

      const res = await fetch("/api/events/my-events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setError("Failed to load events");
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateGroup() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) {
        setError("Please login again");
        return;
      }

      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          name,
          description,
          visibility,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      setSuccess("Group created successfully");
      setName("");
      setDescription("");
      setEventId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <CreateEventTab />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
          <Users className="w-6 h-6" />
          Create Group
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Create a group inside your event
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-5">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-800">
            Select Event *
          </label>

          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
          >
            <option value="">Select Event</option>

            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-800">
            Group Name *
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Bride Side"
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-800">
            Description
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none resize-none"
          />
        </div>

        <div className="mb-7">
          <label className="text-sm font-semibold text-gray-800">
            Visibility
          </label>

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
          >
            <option value="private">Private (Invite only)</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Layers className="w-4 h-4" />
            Group will be created instantly
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={loading || !name || !eventId}
            className="bg-[#0f766e] hover:bg-[#0d5f59] text-white px-6 py-3 rounded-xl font-semibold disabled:bg-gray-400 transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
