// "use client";

// import { useEffect, useState } from "react";
// import { getToken } from "@/lib/auth";
// import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

// export default function MyEventsTab({
//   onCreateGroup,
// }: {
//   onCreateGroup?: (event: any) => void;
// }) {

//   const [events, setEvents] =
//     useState<any[]>([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   // NEW delete states
//   const [showDeleteModal, setShowDeleteModal] =
//     useState(false);

//   const [deleteEventId, setDeleteEventId] =
//     useState<string | null>(null);

//   const [deleting, setDeleting] =
//     useState(false);

//   const token = getToken();

//   // Load events from API
//   async function loadEvents() {

//     try {

//       setLoading(true);
//       setError("");

//       const res = await fetch(
//         "/api/events/my-events",
//         {
//           headers: {
//             Authorization:
//               `Bearer ${token}`,
//           },
//         }
//       );

//       const data =
//         await res.json();

//       if (!res.ok) {
//         throw new Error(
//           data.error ||
//           "Failed to load events"
//         );
//       }

//       setEvents(data.events || []);

//     } catch (err: any) {

//       setError(err.message);

//     } finally {

//       setLoading(false);

//     }

//   }

//   useEffect(() => {
//     loadEvents();
//   }, []);

//   // NEW delete event function
//   async function handleDeleteEvent() {

//     if (!deleteEventId)
//       return;

//     try {

//       setDeleting(true);

//       const res =
//         await fetch(
//           "/api/events/delete",
//           {
//             method: "DELETE",
//             headers: {
//               "Content-Type":
//                 "application/json",
//             },
//             body: JSON.stringify({
//               token,
//               eventId:
//                 deleteEventId,
//             }),
//           }
//         );

//       const data =
//         await res.json();

//       if (!res.ok) {

//         throw new Error(
//           data.error ||
//           "Delete failed"
//         );

//       }

//       alert(
//         "Event deleted successfully"
//       );

//       setShowDeleteModal(false);
//       setDeleteEventId(null);

//       loadEvents();

//     }
//     catch (err: any) {

//       alert(
//         err.message ||
//         "Failed to delete event"
//       );

//     }
//     finally {

//       setDeleting(false);

//     }

//   }

//   // Loading state
//   if (loading)
//     return (
//       <div className="text-black">
//         Loading events...
//       </div>
//     );

//   // Error state
//   if (error)
//     return (
//       <div className="text-red-600">
//         {error}
//       </div>
//     );

//   // Empty state
//   if (events.length === 0)
//     return (
//       <div className="bg-white border rounded-lg p-6 text-center text-gray-600">
//         No events yet. Create your first event.
//       </div>
//     );

//   return (
//     <div>

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">

//         <h1 className="text-2xl font-bold text-black">
//           My Events
//         </h1>

//         <button
//           onClick={loadEvents}
//           className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
//         >
//           Refresh
//         </button>

//       </div>

//       {/* Event Grid */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

//         {events.map((event) => (

//           <div
//             key={event._id}
//             className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
//           >

//             {/* Event Title */}
//             <div className="text-lg font-semibold text-black mb-2">
//               {event.title}
//             </div>

//             {/* Description */}
//             {event.description && (
//               <div className="text-gray-600 mb-3">
//                 {event.description}
//               </div>
//             )}

//             {/* Group Count */}
//             <div className="text-sm text-gray-500 mb-2">
//               Groups:{" "}
//               <span className="font-medium text-black">
//                 {event.groupCount}
//               </span>
//             </div>

//             {/* Created Date */}
//             <div className="text-xs text-gray-400 mb-4">
//               Created:{" "}
//               {new Date(
//                 event.createdAt
//               ).toLocaleDateString()}
//             </div>

//             {/* Actions */}
//             <div className="flex gap-3">

             

//               {/* View Groups */}
//               <button
//                 onClick={() =>
//                   onCreateGroup?.(
//                     event
//                   )
//                 }
//                 className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded text-sm"
//               >
//                 View Groups
//               </button>

//               {/* NEW Delete Event */}
//               <button
//                 onClick={() => {

//                   setDeleteEventId(
//                     event._id
//                   );

//                   setShowDeleteModal(
//                     true
//                   );

//                 }}
//                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
//               >
//                 Delete
//               </button>

//             </div>

//           </div>

//         ))}

//       </div>

//       {/* NEW Delete Modal */}
//       {showDeleteModal && (

//         <DeleteConfirmationModal

//           title="Delete Event"

//           message="This will permanently delete this event, all groups, members, and photos."

//           loading={deleting}

//           onCancel={() =>
//             setShowDeleteModal(false)
//           }

//           onConfirm={
//             handleDeleteEvent
//           }

//         />

//       )}

//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

import {
  CalendarDays,
  RefreshCw,
  FolderOpen,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function MyEventsTab({
  onCreateGroup,
}: {
  onCreateGroup?: (event: any) => void;
}) {
  const [events, setEvents] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // delete states
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteEventId, setDeleteEventId] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const token = getToken();

  // ================= LOAD EVENTS =================
  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch(
        "/api/events/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to load events"
        );
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);


  // ================= DELETE EVENT =================
  async function handleDeleteEvent() {
    if (!deleteEventId) return;
    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(
        "/api/events/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: deleteEventId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Delete failed"
        );
      }

      alert("Event deleted successfully");

      setShowDeleteModal(false);
      setDeleteEventId(null);

      loadEvents();
    } catch (err: any) {
      alert(
        err.message ||
          "Failed to delete event"
      );
    } finally {
      setDeleting(false);
    }
  }

  // ================= LOADER =================
  if (loading)
    return (
      <div className="flex justify-center py-24">
        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />
          <div className="font-medium text-[#111827]">
            Loading your events...
          </div>
        </div>
      </div>
    );

  // ================= ERROR =================
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );

  // ================= EMPTY =================
  if (events.length === 0)
    return (
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-10 text-center shadow-sm">
        <Sparkles className="w-10 h-10 text-[#0f766e] mx-auto mb-3" />
        <div className="font-semibold text-[#111827]">
          No events yet
        </div>
        <div className="text-sm text-[#6b7280] mt-1">
          Create your first event to get started
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            My Events
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Manage and organize your events
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="
            bg-[#e0f2f1]
            hover:bg-[#ccebea]
            text-[#0f766e]
            px-4 py-2
            rounded-lg
            flex items-center gap-2
            text-sm
            border border-[#b2dfdb]
          "
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="
              bg-white
              border border-[#b2dfdb]
              rounded-xl
              p-6
              shadow-sm
              hover:shadow-md
              transition
              flex flex-col
            "
          >
            {/* ICON */}
            <div className="bg-[#e0f2f1] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CalendarDays className="text-[#0f766e]" />
            </div>

            {/* TITLE */}
            <div className="text-lg font-semibold text-[#111827] mb-2">
              {event.title}
            </div>

            {/* DESCRIPTION */}
            {event.description && (
              <div className="text-sm text-[#6b7280] mb-3 line-clamp-2">
                {event.description}
              </div>
            )}

            {/* GROUP COUNT */}
            <div className="text-sm text-[#6b7280] mb-1">
              Groups:{" "}
              <span className="font-medium text-[#111827]">
                {event.groupCount}
              </span>
            </div>

            {/* DATE */}
            <div className="text-xs text-[#9ca3af] mb-4">
              Created{" "}
              {new Date(
                event.createdAt
              ).toLocaleDateString()}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-auto">
              {/* VIEW GROUPS */}
              <button
                onClick={() =>
                  onCreateGroup?.(event)
                }
                className="
                  flex-1
                  bg-[#0f766e]
                  hover:bg-[#0b5e58]
                  text-white
                  py-2
                  rounded-lg
                  text-sm
                  flex items-center justify-center gap-2
                "
              >
                <FolderOpen className="w-4 h-4" />
                View Groups
              </button>

              {/* DELETE */}
              <button
                onClick={() => {
                  setDeleteEventId(event._id);
                  setShowDeleteModal(true);
                }}
                className="
                  px-3
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  rounded-lg
                  flex items-center justify-center
                "
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title="Delete Event"
          message="This will permanently delete this event, all groups, members, and photos."
          loading={deleting}
          onCancel={() =>
            setShowDeleteModal(false)
          }
          onConfirm={handleDeleteEvent}
        />
      )}
    </div>
  );
}
