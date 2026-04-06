"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import {
  Users,
  Layers,
  CalendarPlus2,
  CheckCircle2,
  FolderUp,
  PencilLine,
  UploadCloud,
} from "lucide-react";

type EventItem = {
  _id: string;
  title: string;
};

type EventMode = "select" | "create" | "import";

export default function CreateGroupTab() {
  const [events, setEvents] =
    useState<EventItem[]>([]);
  const [eventMode, setEventMode] =
    useState<EventMode>("select");
  const [eventId, setEventId] =
    useState("");
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [visibility, setVisibility] =
    useState("private");
  const [loading, setLoading] =
    useState(false);
  const [loadingEvents, setLoadingEvents] =
    useState(true);
  const [error, setError] = useState("");
  const [eventTitle, setEventTitle] =
    useState("");
  const [eventDescription, setEventDescription] =
    useState("");
  const [creatingEvent, setCreatingEvent] =
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
  const [importEventName, setImportEventName] =
    useState("");
  const [eventChoice, setEventChoice] =
    useState("__new__");

  async function loadEvents() {
    try {
      setLoadingEvents(true);
      const token = getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const res = await fetch("/api/events/my-events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load events"
        );
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(
        err.message || "Failed to load events"
      );
    } finally {
      setLoadingEvents(false);
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
  }, [eventMode]);

  async function handleInlineCreateEvent() {
    try {
      setCreatingEvent(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to create event"
        );
      }

      const createdEvent = data?.event;
      await loadEvents();

      if (createdEvent?._id) {
        setEventId(createdEvent._id);
      }

      setEventTitle("");
      setEventDescription("");
      setEventMode("select");
      toast.success(
        "Event created. You can now create a group inside it."
      );
    } catch (err: any) {
      const message =
        err.message || "Failed to create event";
      setError(message);
      toast.error(message);
    } finally {
      setCreatingEvent(false);
    }
  }

  async function handleCreateGroup() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Please login again");
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
        throw new Error(
          data.error || "Failed to create group"
        );
      }

      setName("");
      setDescription("");
      setVisibility("private");
      toast.success(
        "Group created successfully. You can create another one for the same event or switch events."
      );
    } catch (err: any) {
      const message =
        err.message || "Failed to create group";
      setError(message);
      toast.error(message);
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

    setImportEventName(folderRoot || "New Event");
    setEventChoice("__new__");
    setShowConfirm(true);
  }

  async function handleFolderImport() {
    try {
      setFolderLoading(true);
      setFolderError("");
      setFolderSuccess("");
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Please login again");
      }

      let uploadEventId = eventChoice;

      if (eventChoice === "__new__") {
        const trimmedName =
          importEventName.trim();
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
          data.error || "Import failed"
        );
      }

      setEventId(uploadEventId);
      setFolderSuccess(
        `Import complete. Groups created: ${data.groupCount}`
      );
      toast.success(
        "Event import complete. You can now review the created groups or add another one below."
      );
      setShowConfirm(false);
      setFolderFiles([]);
      setFolderGroups([]);
      setFolderRoot("");
      setImportEventName("");
      setEventMode("select");
    } catch (err: any) {
      const message =
        err.message || "Import failed";
      setFolderError(message);
      toast.error(message);
    } finally {
      setFolderLoading(false);
    }
  }

  const selectedEvent = events.find(
    (event) => event._id === eventId
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
            <Users className="h-5 w-5" />
          </span>
          Create Group
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose how to start your event setup, then create a group inside the selected event.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-[#3cc2bf]/15 pb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Step 1: Choose How To Start
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Select an existing event, create a new one, or import a folder and let groups be created automatically.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setEventMode("select")}
            className={`rounded-[24px] border p-5 text-left transition ${
              eventMode === "select"
                ? "border-[#1f6563]/30 bg-[#f5fbfb] shadow-sm"
                : "border-[#3cc2bf]/20 bg-white hover:bg-[#f8fcfc]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-semibold text-slate-900">
                  Select Existing
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Use an event you already created.
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setEventMode("create")}
            className={`rounded-[24px] border p-5 text-left transition ${
              eventMode === "create"
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
                  Create New Event
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Make a fresh event, then add groups inside it.
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setEventMode("import")}
            className={`rounded-[24px] border p-5 text-left transition ${
              eventMode === "import"
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
                  Create an event and groups from folder structure.
                </div>
              </div>
            </div>
          </button>
        </div>

        {eventMode === "select" && (
          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Select Event
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
            >
              <option value="">
                {loadingEvents ? "Loading events..." : "Select an event"}
              </option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {eventMode === "create" && (
          <div className="mt-5 rounded-[24px] border border-[#3cc2bf]/15 bg-[#f8fcfc] p-5">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Event Title
                </label>
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ex: Riya Wedding"
                  className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Optional description about this event..."
                  className="mt-2 w-full resize-none rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleInlineCreateEvent}
                  disabled={creatingEvent || !eventTitle.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <CalendarPlus2 className="h-4 w-4" />
                  {creatingEvent ? "Creating..." : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        )}

        {eventMode === "import" && (
          <div className="mt-5 rounded-[24px] border border-[#3cc2bf]/15 bg-[#f8fcfc] p-5">
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

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#3cc2bf]/25 p-8 text-center transition hover:bg-white">
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
              <div className="mt-4 rounded-[24px] border border-[#3cc2bf]/15 bg-white p-4 text-sm text-slate-600">
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
                <Layers className="h-4 w-4" />
                Event and groups will be created instantly after confirmation.
              </div>

              <button
                onClick={openConfirm}
                disabled={folderLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-[#1f6563] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {folderLoading ? "Importing..." : "Continue Import"}
              </button>
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f6563]/8 px-3 py-1 text-xs font-medium text-[#1f6563]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Creating group inside {selectedEvent.title}
          </div>
        )}
      </div>

      <div className={`rounded-[28px] border bg-white p-6 shadow-sm transition ${eventId ? "border-[#3cc2bf]/20" : "border-slate-200 opacity-75"}`}>
        <div className="mb-5 border-b border-[#3cc2bf]/15 pb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Step 2: Create Group
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Add the group details after you select or create the event it belongs to.
          </p>
        </div>

        {!eventId ? (
          <div className="rounded-[24px] border border-dashed border-[#3cc2bf]/20 bg-[#f8fcfc] px-5 py-10 text-center">
            <div className="text-base font-semibold text-slate-900">
              Finish Step 1 first
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Once your event is selected, created, or imported, the group form will be ready to use.
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Group Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bride Side"
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
                placeholder="Optional description for the group..."
                className="mt-2 w-full resize-none rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
              >
                <option value="private">Private (Invite only)</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#3cc2bf]/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Layers className="h-4 w-4" />
                Group will be created instantly inside the selected event.
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={loading || !name.trim() || !eventId}
                className="inline-flex items-center justify-center rounded-2xl bg-[#1f6563] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        )}
      </div>

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
                value={importEventName}
                onChange={(e) => setImportEventName(e.target.value)}
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
                onChange={(e) => setEventChoice(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#3cc2bf]/20 bg-white px-4 py-3 text-slate-900 focus:border-[#1f6563] focus:outline-none focus:ring-4 focus:ring-[#3cc2bf]/20"
              >
                <option value="__new__">Create new event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFolderImport}
                disabled={folderLoading}
                className="rounded-xl bg-[#1f6563] px-4 py-2 text-white disabled:bg-slate-400"
              >
                {folderLoading ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
