
"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  Calendar,
  Sparkles,
  UploadCloud,
  FolderUp,
} from "lucide-react";

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
  const [events, setEvents] = useState<any[]>([]);
  const [showUpload, setShowUpload] =
    useState(false);
  const folderInputRef =
    useRef<HTMLInputElement>(null);

  const [folderFiles, setFolderFiles] =
    useState<File[]>([]);
  const [folderRoot, setFolderRoot] =
    useState("");
  const [folderGroups, setFolderGroups] =
    useState<string[]>([]);
  const [folderError, setFolderError] =
    useState("");
  const [folderSuccess, setFolderSuccess] =
    useState("");
  const [folderLoading, setFolderLoading] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);
  const [eventName, setEventName] =
    useState("");
  const [eventChoice, setEventChoice] =
    useState("__new__");

  async function loadEvents() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        "/api/events/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute(
        "webkitdirectory",
        ""
      );
      folderInputRef.current.setAttribute(
        "directory",
        ""
      );
    }
  }, [showUpload]);

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

  function handleFolderSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    setFolderError("");
    setFolderSuccess("");

    if (selectedFiles.length === 0) {
      setFolderFiles([]);
      setFolderGroups([]);
      setFolderRoot("");
      return;
    }

    const groupSet = new Set<string>();
    let rootName = "";

    selectedFiles.forEach((file) => {
      const relPath =
        (file as any).webkitRelativePath ||
        file.name;
      const normalized = String(relPath).replace(
        /\\/g,
        "/"
      );
      const segments = normalized
        .split("/")
        .filter(Boolean);

      if (!rootName && segments[0]) {
        rootName = segments[0];
      }

      if (segments.length >= 3) {
        groupSet.add(segments[1]);
      } else {
        groupSet.add("General");
      }
    });

    setFolderFiles(selectedFiles);
    setFolderGroups(Array.from(groupSet));
    setFolderRoot(rootName || "Event");
  }

  function openConfirm() {
    if (folderFiles.length === 0) {
      setFolderError("Select a folder first");
      return;
    }

    setEventName(folderRoot || "New Event");
    setEventChoice("__new__");
    setShowConfirm(true);
  }

  async function handleFolderUpload() {
    try {
      setFolderLoading(true);
      setFolderError("");
      setFolderSuccess("");

      const token = getToken();
      if (!token) {
        throw new Error("Please login again");
      }

      let uploadEventId = eventChoice;

      if (eventChoice === "__new__") {
        const trimmedName =
          eventName.trim();
        if (!trimmedName) {
          throw new Error("Event name required");
        }

        const res = await fetch(
          "/api/events/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: trimmedName,
              description: "",
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Failed to create event"
          );
        }

        uploadEventId = data?.event?._id;
        await loadEvents();
      }

      if (!uploadEventId) {
        throw new Error("Select an event");
      }

      const formData = new FormData();
      formData.append("eventId", uploadEventId);
      formData.append("visibility", "private");

      folderFiles.forEach((file) => {
        const relPath =
          (file as any).webkitRelativePath ||
          file.name;
        formData.append("file", file, relPath);
      });

      const res = await fetch(
        "/api/photos/upload-folder",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Upload failed"
        );
      }

      setFolderSuccess(
        `Upload complete. Groups created: ${data.groupCount}`
      );
      setShowConfirm(false);
      setFolderFiles([]);
      setFolderGroups([]);
      setFolderRoot("");
    } catch (err: any) {
      setFolderError(err.message);
  } finally {
      setFolderLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* ================= HEADER ================= */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Create Event
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Create a new event to manage groups and photos
          </p>
        </div>

        <button
          onClick={() =>
            setShowUpload(!showUpload)
          }
          className="bg-[#e0f2f1] hover:bg-[#ccebea] text-[#0f766e] px-4 py-2 rounded-lg text-sm border border-[#b2dfdb] flex items-center gap-2"
        >
          <FolderUp className="w-4 h-4" />
          Direct Upload
        </button>
      </div>

      {/* ================= MAIN CARD ================= */}
      {!showUpload && (
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
      )}

      {showUpload && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <UploadCloud className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Folder
              </h2>
              <p className="text-sm text-gray-500">
                Create event and groups from folder structure
              </p>
            </div>
          </div>

          {folderSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
              {folderSuccess}
            </div>
          )}

          {folderError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
              {folderError}
            </div>
          )}

          <label
            className="
              border-2 border-dashed border-gray-300
              rounded-xl
              p-8
              flex flex-col items-center justify-center
              cursor-pointer
              hover:bg-gray-50
              transition
            "
          >
            <UploadCloud className="w-8 h-8 text-gray-600 mb-3" />
            <div className="font-medium text-gray-800">
              Click to select a folder
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Subfolders become groups, root photos go to General
            </div>

            <input
              ref={folderInputRef}
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFolderSelect}
            />
          </label>

          {folderFiles.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <div>
                Event name:{" "}
                <span className="font-medium text-gray-900">
                  {folderRoot}
                </span>
              </div>
              <div>
                Files:{" "}
                <span className="font-medium text-gray-900">
                  {folderFiles.length}
                </span>
              </div>
              <div className="mt-2">
                Groups to create:{" "}
                <span className="font-medium text-gray-900">
                  {folderGroups.join(", ")}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Event and groups will be created instantly
            </div>

            <button
              onClick={openConfirm}
              disabled={folderLoading}
              className="bg-[#0f766e] hover:bg-[#0d5f59] text-white px-6 py-3 rounded-xl font-semibold disabled:bg-gray-400 transition"
            >
              Upload Folder
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Upload
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Your event name will be{" "}
              <span className="font-semibold text-gray-900">
                {folderRoot || "New Event"}
              </span>
              . You can rename it or choose an existing event.
            </p>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800">
                Event Name
              </label>
              <input
                value={eventName}
                onChange={(e) =>
                  setEventName(e.target.value)
                }
                disabled={eventChoice !== "__new__"}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-800">
                Use Existing Event (optional)
              </label>
              <select
                value={eventChoice}
                onChange={(e) =>
                  setEventChoice(e.target.value)
                }
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
              >
                <option value="__new__">
                  Create new event
                </option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFolderUpload}
                disabled={folderLoading}
                className="px-4 py-2 rounded-lg bg-[#0f766e] text-white disabled:bg-gray-400"
              >
                {folderLoading
                  ? "Uploading..."
                  : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
