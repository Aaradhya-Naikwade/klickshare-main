"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  Calendar,
  Sparkles,
  UploadCloud,
  FolderUp,
  PencilLine,
} from "lucide-react";

type EventItem = {
  _id: string;
  title: string;
};

type CreationMode = "manual" | "upload";

export default function CreateEventTab({
  onEventCreated,
}: {
  onEventCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [success, setSuccess] =
    useState("");
  const [error, setError] = useState("");
  const [events, setEvents] =
    useState<EventItem[]>([]);
  const [mode, setMode] =
    useState<CreationMode>("manual");
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
    void loadEvents();
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
  }, [mode]);

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to create event"
        );
      }

      setSuccess(
        "Event created successfully. You can now start managing groups inside it."
      );
      setTitle("");
      setDescription("");

      onEventCreated?.();
      await loadEvents();
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
      onEventCreated?.();
    } catch (err: any) {
      setFolderError(err.message);
    } finally {
      setFolderLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
            <Calendar className="h-5 w-5" />
          </span>
          Create Event
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose how you want to set up the event. You can create it manually or import a folder and let groups be created from the folder structure.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded-[24px] border p-5 text-left transition ${
            mode === "manual"
              ? "border-[#1f6563]/30 bg-[#f5fbfb] shadow-sm"
              : "border-[#3cc2bf]/20 bg-white hover:bg-[#f8fcfc]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
              <PencilLine className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-semibold text-slate-900">
                Create Manually
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Best when you want to add the event first and create groups later.
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`rounded-[24px] border p-5 text-left transition ${
            mode === "upload"
              ? "border-[#1f6563]/30 bg-[#f5fbfb] shadow-sm"
              : "border-[#3cc2bf]/20 bg-white hover:bg-[#f8fcfc]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
              <FolderUp className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-semibold text-slate-900">
                Import From Folder
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Best when your files are already organized into folders and subfolders.
              </div>
            </div>
          </div>
        </button>
      </div>

      {mode === "manual" && (
        <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
          {success && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="mb-5 border-b border-[#3cc2bf]/15 pb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Manual Event Setup
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Create the event first, then continue with group creation from the next step in your dashboard.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Event Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Riya Wedding"
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description about this event..."
                className="mt-2 w-full resize-none rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-[#3cc2bf]/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="h-4 w-4" />
                Event will be created instantly.
              </div>

              <button
                onClick={handleCreateEvent}
                disabled={loading || !title.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-[#1f6563] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-[#3cc2bf]/15 pb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Import From Folder
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload a folder to create an event and generate groups from subfolders automatically.
            </p>
          </div>

          {folderSuccess && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
              {folderSuccess}
            </div>
          )}

          {folderError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {folderError}
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#3cc2bf]/25 p-8 text-center transition hover:bg-[#f8fcfc]">
            <UploadCloud className="mb-3 h-8 w-8 text-[#1f6563]" />
            <div className="font-medium text-slate-800">
              Click to select a folder
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Subfolders become groups, and root-level photos go into General.
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
            <div className="mt-4 rounded-[24px] border border-[#3cc2bf]/15 bg-[#f8fcfc] p-4 text-sm text-slate-600">
              <div>
                Event name: <span className="font-medium text-slate-900">{folderRoot}</span>
              </div>
              <div className="mt-1">
                Files: <span className="font-medium text-slate-900">{folderFiles.length}</span>
              </div>
              <div className="mt-2">
                Groups to create: <span className="font-medium text-slate-900">{folderGroups.join(", ")}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-[#3cc2bf]/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="h-4 w-4" />
              Event and groups will be created instantly after confirmation.
            </div>

            <button
              onClick={openConfirm}
              disabled={folderLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-[#1f6563] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {folderLoading ? "Uploading..." : "Continue Import"}
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm Import
            </h3>
            <p className="mb-4 mt-2 text-sm text-slate-600">
              Choose whether to create a new event from this folder or place the upload inside an existing event.
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700">
                Event Name
              </label>
              <input
                value={eventName}
                onChange={(e) =>
                  setEventName(e.target.value)
                }
                disabled={eventChoice !== "__new__"}
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20 disabled:bg-slate-100"
              />
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Use Existing Event
              </label>
              <select
                value={eventChoice}
                onChange={(e) =>
                  setEventChoice(e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
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
                className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFolderUpload}
                disabled={folderLoading}
                className="rounded-xl bg-[#1f6563] px-4 py-2 text-white disabled:bg-slate-400"
              >
                {folderLoading ? "Uploading..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
