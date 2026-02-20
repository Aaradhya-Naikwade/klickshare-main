// "use client";

// import { useState } from "react";
// import { getToken } from "@/lib/auth";

// export default function JoinGroupTab() {

//   const [inviteCode, setInviteCode] =
//     useState("");

//   const [loading, setLoading] =
//     useState(false);

//   const [success, setSuccess] =
//     useState("");

//   const [error, setError] =
//     useState("");

//   const [status, setStatus] =
//     useState("");

//   async function handleJoin() {

//     try {

//       setLoading(true);
//       setError("");
//       setSuccess("");
//       setStatus("");

//       const token =
//         getToken();

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
//             inviteCode,
//           }),
//         }
//       );

//       const data =
//         await res.json();

//       if (!res.ok) {
//         throw new Error(
//           data.error ||
//             "Failed to join group"
//         );
//       }

//       setStatus(data.status);

//       if (
//         data.status ===
//         "approved"
//       ) {

//         setSuccess(
//           "Successfully joined group"
//         );

//       } else {

//         setSuccess(
//           "Join request sent. Waiting for approval."
//         );

//       }

//       setInviteCode("");

//     } catch (err: any) {

//       setError(err.message);

//     } finally {

//       setLoading(false);

//     }

//   }

//   return (
//     <div className="max-w-xl">

//       {/* Header */}
//       <h1 className="text-2xl font-bold text-black mb-6">
//         Join New Group
//       </h1>

//       <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

//         {/* Success */}
//         {success && (
//           <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
//             {success}
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         {/* Invite Code Input */}
//         <div className="mb-6">

//           <label className="text-sm font-medium text-black">
//             Enter Invite Code
//           </label>

//           <input
//             value={inviteCode}
//             onChange={(e) =>
//               setInviteCode(
//                 e.target.value.toUpperCase()
//               )
//             }
//             placeholder="Ex: A1B2C3D4"
//             className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-black uppercase tracking-wider"
//           />

//         </div>

//         {/* Join Button */}
//         <button
//           onClick={handleJoin}
//           disabled={
//             loading ||
//             !inviteCode
//           }
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
//         >

//           {loading
//             ? "Joining..."
//             : "Join Group"}

//         </button>

//         {/* Info */}
//         <div className="mt-6 text-sm text-gray-500">

//           Private groups can only be joined using invite codes or QR codes.

//         </div>

//       </div>

//     </div>
//   );
// }






"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import {
  Users,
  KeyRound,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function JoinGroupTab() {

  const [inviteCode, setInviteCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  async function handleJoin() {

    try {

      setLoading(true);

      const token =
        getToken();

      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch(
        "/api/groups/join",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            inviteCode,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to join group"
        );
      }

      setStatus(data.status);

      if (
        data.status ===
        "approved"
      ) {

        toast.success(
          "Successfully joined group"
        );

      } else {

        toast.success(
          "Join request sent for approval"
        );

      }

      setInviteCode("");

    } catch (err: any) {

      toast.error(
        err.message
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="max-w-xl space-y-6">

      {/* HEADER */}
      <div>

        <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">

          <Users className="w-6 h-6" />

          Join New Group

        </h1>

        <p className="text-sm text-[#6b7280] mt-1">

          Enter an invite code to join a private group

        </p>

      </div>

      {/* CARD */}
      <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-6">

        {/* SUCCESS STATUS */}
        {status === "approved" && (

          <div className="bg-[#e0f2f1] border border-[#b2dfdb] text-[#0f766e] p-4 rounded-lg flex items-center gap-3 mb-4">

            <CheckCircle className="w-5 h-5" />

            Successfully joined the group

          </div>

        )}

        {status === "pending" && (

          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-center gap-3 mb-4">

            <Clock className="w-5 h-5" />

            Request sent. Waiting for approval

          </div>

        )}

        {/* INPUT */}
        <div className="mb-6">

          <label className="text-sm font-medium text-[#111827]">

            Invite Code

          </label>

          <div className="relative mt-1">

            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f766e] w-5 h-5" />

            <input
              value={inviteCode}
              onChange={(e) =>
                setInviteCode(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="Enter invite code"
              className="
                w-full
                pl-10
                pr-4
                py-3
                border border-[#b2dfdb]
                rounded-lg
                text-[#111827]
                uppercase
                tracking-widest
                focus:ring-2
                focus:ring-[#0f766e]
                focus:border-[#0f766e]
                outline-none
              "
            />

          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleJoin}
          disabled={
            loading ||
            !inviteCode
          }
          className="
            w-full
            bg-[#0f766e]
            hover:bg-[#0b5e58]
            text-white
            py-3
            rounded-lg
            font-medium
            flex
            items-center
            justify-center
            gap-2
            transition
            disabled:opacity-50
          "
        >

          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Joining group...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Join Group
            </>
          )}

        </button>

        {/* INFO */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">

          <div className="text-sm text-[#6b7280]">

            Private groups require an invite code or QR code provided by the group admin.

          </div>

        </div>

      </div>

    </div>

  );

}
