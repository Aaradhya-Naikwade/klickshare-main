// "use client";

// import { useEffect, useState } from "react";
// import { getToken } from "@/lib/auth";

// export default function PublicGroupsTab() {

//   const [groups, setGroups] =
//     useState<any[]>([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [joiningId,
//     setJoiningId] =
//     useState("");

//   const token = getToken();

//   async function loadGroups() {

//     const res = await fetch(
//       "/api/groups/public"
//     );

//     const data =
//       await res.json();

//     setGroups(data.groups || []);

//     setLoading(false);

//   }

//   useEffect(() => {
//     loadGroups();
//   }, []);

//   async function joinGroup(
//     groupId: string
//   ) {

//     try {

//       setJoiningId(groupId);

//       const res = await fetch(
//         "/api/groups/join",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             token,
//             groupId,
//           }),
//         }
//       );

//       const data =
//         await res.json();

//       alert(
//         data.status ===
//           "approved"
//           ? "Joined successfully"
//           : "Request sent"
//       );

//     } catch {

//       alert("Failed to join");

//     } finally {

//       setJoiningId("");

//     }

//   }

//   if (loading)
//     return <div>Loading...</div>;

//   return (
//     <div>

//       <h1 className="text-2xl font-bold text-black mb-6">
//         Public Groups
//       </h1>

//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

//         {groups.map(
//           (group) => (

//             <div
//               key={group._id}
//               className="bg-white border rounded-xl p-6 shadow-sm"
//             >

//               <div className="text-lg font-semibold text-black">
//                 {group.name}
//               </div>

//               <div className="text-sm text-gray-500 mb-2">
//                 Event:{" "}
//                 {
//                   group
//                     .eventId
//                     ?.title
//                 }
//               </div>

//               <div className="text-xs text-gray-400 mb-4">
//                 Created:{" "}
//                 {new Date(
//                   group.createdAt
//                 ).toLocaleDateString()}
//               </div>

//               <button
//                 onClick={() =>
//                   joinGroup(
//                     group._id
//                   )
//                 }
//                 disabled={
//                   joiningId ===
//                   group._id
//                 }
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
//               >

//                 {joiningId ===
//                 group._id
//                   ? "Joining..."
//                   : "Join"}

//               </button>

//             </div>

//           )
//         )}

//       </div>

//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import {
  Users,
  Loader2,
  Globe,
  CalendarDays,
  UserPlus,
} from "lucide-react";

export default function PublicGroupsTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState("");

  const token = getToken();

  async function loadGroups() {
    const res = await fetch("/api/groups/public");
    const data = await res.json();

    setGroups(data.groups || []);
    setLoading(false);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function joinGroup(groupId: string) {
    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setJoiningId(groupId);

      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
        }),
      });

      const data = await res.json();

      toast.success(
        data.status === "approved"
          ? "Joined successfully"
          : "Request sent"
      );
    } catch {
      toast.error("Failed to join");
    } finally {
      setJoiningId("");
    }
  }

  // ================= LOADING =================
  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />
          <div className="font-medium text-[#111827]">
            Loading public groups...
          </div>
        </div>
      </div>
    );

  // ================= EMPTY =================
  if (groups.length === 0)
    return (
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-10 text-center shadow-sm">
        <Users className="w-10 h-10 text-[#0f766e] mx-auto mb-3" />
        <div className="font-semibold text-[#111827]">
          No public groups available
        </div>
        <div className="text-sm text-[#6b7280] mt-1">
          Check back later for new groups
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Public Groups
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Discover and join public groups
        </p>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group._id}
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
              <Users className="text-[#0f766e]" />
            </div>

            {/* NAME */}
            <div className="text-lg font-semibold text-[#111827] mb-2">
              {group.name}
            </div>

            {/* EVENT */}
            <div className="flex items-center gap-2 text-sm mb-2">
              <CalendarDays className="w-4 h-4 text-[#0f766e]" />
              <span className="text-[#6b7280]">
                {group.event?.title || group.eventId?.title}
              </span>
            </div>

            {/* DATE */}
            <div className="text-xs text-[#6b7280] mb-4">
              Created{" "}
              {new Date(group.createdAt).toLocaleDateString()}
            </div>

            {/* BUTTON */}
            <button
              onClick={() => joinGroup(group._id)}
              disabled={joiningId === group._id}
              className="
                mt-auto
                bg-[#0f766e]
                hover:bg-[#0b5e58]
                text-white
                py-2
                rounded-lg
                text-sm
                flex items-center justify-center gap-2
                shadow-sm
                disabled:opacity-70
              "
            >
              {joiningId === group._id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Join Group
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
