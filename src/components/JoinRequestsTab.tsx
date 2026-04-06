// "use client";

// import { useEffect, useState } from "react";
// import { getToken } from "@/lib/auth";

// export default function JoinRequestsTab() {

//   const [requests, setRequests] =
//     useState<any[]>([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const [processingId,
//     setProcessingId] =
//     useState("");

//   // Load join requests
//   async function loadRequests() {

//     try {

//       setLoading(true);

//       const token =
//         getToken();

//       const res = await fetch(
//         "/api/groups/join-requests",
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
//           data.error
//         );
//       }

//       setRequests(
//         data.requests
//       );

//     } catch (err: any) {

//       setError(
//         err.message
//       );

//     } finally {

//       setLoading(false);

//     }

//   }

//   useEffect(() => {
//     loadRequests();
//   }, []);

//   // Update member
//   async function handleAction(
//     memberId: string,
//     groupId: string,
//     action: string
//   ) {

//     try {

//       setProcessingId(
//         memberId
//       );

//       const token =
//         getToken();

//       const res =
//         await fetch(
//           "/api/groups/update-member",
//           {
//             method: "PUT",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body:
//               JSON.stringify({
//                 token,
//                 memberId,
//                 groupId,
//                 action,
//               }),
//           }
//         );

//       const data =
//         await res.json();

//       if (!res.ok) {
//         throw new Error(
//           data.error
//         );
//       }

//       // reload list
//       loadRequests();

//     } catch (err: any) {

//       alert(
//         err.message
//       );

//     } finally {

//       setProcessingId(
//         ""
//       );

//     }

//   }

//   return (
//     <div>

//       {/* Header */}
//       <h1 className="text-2xl font-bold text-black mb-6">
//         Join Requests
//       </h1>

//       {/* Error */}
//       {error && (
//         <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Loading */}
//       {loading && (
//         <div className="text-black">
//           Loading requests...
//         </div>
//       )}

//       {/* Empty */}
//       {!loading &&
//         requests.length === 0 && (
//           <div className="bg-white border rounded-lg p-6 text-center text-gray-600">
//             No pending requests
//           </div>
//         )}

//       {/* Request List */}
//       <div className="space-y-4">

//         {requests.map(
//           (req) => (

//             <div
//               key={req._id}
//               className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between"
//             >

//               {/* User Info */}
//               <div className="flex items-center gap-4">

//                 <img
//                   src={
//                     req.userId
//                       .profilePhoto ||
//                     `https://ui-avatars.com/api/?name=${req.userId.name}`
//                   }
//                   className="w-12 h-12 rounded-full object-cover"
//                 />

//                 <div>

//                   <div className="font-medium text-black">
//                     {
//                       req.userId
//                         .name
//                     }
//                   </div>

//                   <div className="text-sm text-gray-500">
//                     {
//                       req.groupId
//                         .name
//                     }
//                   </div>

//                   <div className="text-xs text-gray-400">
//                     {
//                       req.userId
//                         .phone
//                     }
//                   </div>

//                 </div>

//               </div>

//               {/* Actions */}
//               <div className="flex gap-2">

//                 <button
//                   onClick={() =>
//                     handleAction(
//                       req._id,
//                       req.groupId._id,
//                       "approve"
//                     )
//                   }
//                   disabled={
//                     processingId ===
//                     req._id
//                   }
//                   className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
//                 >
//                   Approve
//                 </button>

//                 <button
//                   onClick={() =>
//                     handleAction(
//                       req._id,
//                       req.groupId._id,
//                       "reject"
//                     )
//                   }
//                   disabled={
//                     processingId ===
//                     req._id
//                   }
//                   className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
//                 >
//                   Reject
//                 </button>

//                 <button
//                   onClick={() =>
//                     handleAction(
//                       req._id,
//                       req.groupId._id,
//                       "block"
//                     )
//                   }
//                   disabled={
//                     processingId ===
//                     req._id
//                   }
//                   className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
//                 >
//                   Block
//                 </button>

//               </div>

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
  Check,
  X,
  Ban,
  Loader2,
  Phone,
  UserRoundPlus,
  FolderOpen,
} from "lucide-react";

export default function JoinRequestsTab() {

  const [requests, setRequests] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [processingId,
    setProcessingId] =
    useState("");

  const pendingCount =
    requests.length;

  // LOAD REQUESTS
  async function loadRequests() {

    try {

      setLoading(true);

      const token =
        getToken();
      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch(
        "/api/groups/join-requests",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error
        );
      }

      setRequests(
        data.requests
      );

    } catch (err: any) {

      setError(
        err.message
      );

      toast.error(
        err.message
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {
    loadRequests();
  }, []);

  // ACTION HANDLER
  async function handleAction(
    memberId: string,
    groupId: string,
    action: string
  ) {

    try {

      setProcessingId(
        memberId
      );

      const token =
        getToken();
      if (!token) {
        throw new Error("Please login again");
      }

      const res =
        await fetch(
          "/api/groups/update-member",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                memberId,
                groupId,
                action,
              }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error
        );
      }

      toast.success(
        `Request ${action}ed successfully`
      );

      loadRequests();

    } catch (err: any) {

      toast.error(
        err.message
      );

    } finally {

      setProcessingId(
        ""
      );

    }

  }

  // LOADING STATE
  if (loading)
    return (

      <div className="flex justify-center py-20">

        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">

          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />

          <div className="font-medium text-[#111827]">
            Loading join requests...
          </div>

        </div>

      </div>

    );

  return (

    <div className="max-w-4xl space-y-6">

      {/* HEADER */}
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                <Users className="h-5 w-5" />
              </span>
              Join Requests
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review incoming group requests and decide who gets access.
            </p>
          </div>

          <div className="sm:w-fit">
            <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Pending
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1f6563]">
                {pendingCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">

          {error}

        </div>

      )}

      {/* EMPTY */}
      {!loading &&
        requests.length === 0 && (

          <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#3cc2bf]/12 text-[#1f6563]">
              <Users className="h-7 w-7" />
            </div>

            <div className="text-lg font-semibold text-slate-900">
              No pending requests
            </div>

            <div className="mt-2 text-sm text-slate-600">
              New join requests will appear here
            </div>

          </div>

        )}

      {/* LIST */}
      <div className="space-y-4">

        {requests.map(
          (req) => {
            const requestUser =
              req.user || req.userId || {};
            const requestGroup =
              req.group || req.groupId || {};

            return (

            <div
              key={req._id}
              className="rounded-[26px] border border-[#3cc2bf]/20 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        requestUser
                          .profilePhoto ||
                        `https://ui-avatars.com/api/?name=${requestUser.name || "User"}`
                      }
                      className="h-14 w-14 shrink-0 rounded-2xl border border-[#3cc2bf]/20 object-cover"
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#1f6563]/8 px-3 py-1 text-xs font-medium text-[#1f6563]">
                          <UserRoundPlus className="h-3.5 w-3.5" />
                          Pending request
                        </span>
                      </div>

                      <div className="mt-3 text-lg font-semibold text-slate-900">
                        {requestUser.name || "Unknown User"}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                        <div className="inline-flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-[#1f6563]" />
                          <span className="font-medium text-slate-700">
                            Group:
                          </span>
                          <span className="text-[#1f6563]">
                            {requestGroup.name || "Unknown Group"}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#1f6563]" />
                          <span className="font-medium text-slate-700">
                            Mobile:
                          </span>
                          <span>{requestUser.phone || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:ml-4 lg:justify-end">

                {/* APPROVE */}
                <button
                  onClick={() =>
                    handleAction(
                      req._id,
                      requestGroup._id,
                      "approve"
                    )
                  }
                  disabled={
                    processingId ===
                    req._id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6563] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#174d4b] disabled:opacity-50"
                >

                  {processingId ===
                    req._id
                    ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )
                    : (
                      <Check className="w-4 h-4" />
                    )
                  }

                  Approve

                </button>

                {/* REJECT */}
                <button
                  onClick={() =>
                    handleAction(
                      req._id,
                      requestGroup._id,
                      "reject"
                    )
                  }
                  disabled={
                    processingId ===
                    req._id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                >

                  <X className="w-4 h-4" />

                  Reject

                </button>

                {/* BLOCK */}
                <button
                  onClick={() =>
                    handleAction(
                      req._id,
                      requestGroup._id,
                      "block"
                    )
                  }
                  disabled={
                    processingId ===
                    req._id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                >

                  <Ban className="w-4 h-4" />

                  Block

                </button>

                </div>
              </div>
            </div>
            );
          }
        )}

      </div>

    </div>

  );

}
