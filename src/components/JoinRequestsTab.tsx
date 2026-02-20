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

    <div className="max-w-3xl space-y-6">

      {/* HEADER */}
      <div>

        <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">

          <Users className="w-6 h-6" />

          Join Requests

        </h1>

        <p className="text-sm text-[#6b7280] mt-1">
          Manage group join requests
        </p>

      </div>

      {/* ERROR */}
      {error && (

        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">

          {error}

        </div>

      )}

      {/* EMPTY */}
      {!loading &&
        requests.length === 0 && (

          <div className="bg-white border border-[#b2dfdb] rounded-xl p-10 text-center shadow-sm">

            <Users className="w-10 h-10 text-[#0f766e] mx-auto mb-3" />

            <div className="font-semibold text-[#111827]">
              No pending requests
            </div>

            <div className="text-sm text-[#6b7280] mt-1">
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
              className="
                bg-white
                border border-[#b2dfdb]
                rounded-xl
                p-5
                shadow-sm
                flex
                items-center
                justify-between
                hover:shadow-md
                transition
              "
            >

              {/* USER INFO */}
              <div className="flex items-center gap-4">

                <img
                  src={
                    requestUser
                      .profilePhoto ||
                    `https://ui-avatars.com/api/?name=${requestUser.name || "User"}`
                  }
                  className="
                    w-12 h-12
                    rounded-full
                    object-cover
                    border border-[#b2dfdb]
                  "
                />

                <div>

                  <div className="font-medium text-[#111827]">
                    {
                      requestUser.name || "Unknown User"
                    }
                  </div>

                  <div className="text-sm text-[#0f766e]">
                    {
                      requestGroup.name || "Unknown Group"
                    }
                  </div>

                  <div className="text-xs text-[#6b7280]">
                    {
                      requestUser.phone || "-"
                    }
                  </div>

                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">

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
                  className="
                    bg-[#0f766e]
                    hover:bg-[#0b5e58]
                    text-white
                    px-3 py-2
                    rounded-lg
                    text-sm
                    flex items-center gap-1
                    shadow-sm
                    disabled:opacity-50
                  "
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
                  className="
                    bg-yellow-500
                    hover:bg-yellow-600
                    text-white
                    px-3 py-2
                    rounded-lg
                    text-sm
                    flex items-center gap-1
                    shadow-sm
                    disabled:opacity-50
                  "
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
                  className="
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    px-3 py-2
                    rounded-lg
                    text-sm
                    flex items-center gap-1
                    shadow-sm
                    disabled:opacity-50
                  "
                >

                  <Ban className="w-4 h-4" />

                  Block

                </button>

              </div>

            </div>
            );
          }
        )}

      </div>

    </div>

  );

}
