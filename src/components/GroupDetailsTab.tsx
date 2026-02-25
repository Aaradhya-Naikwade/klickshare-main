// "use client";

// import { useEffect, useState } from "react";
// import { getToken } from "@/lib/auth";
// import { toast } from "sonner";

// import UploadPhotoTab from "@/components/UploadPhotoTab";
// import GroupPhotosTab from "@/components/GroupPhotosTab";

// import {
//   Users,
//   Copy,
//   LogOut,
//   Shield,
//   Eye,
//   Crown,
//   Loader2,
//   UserCog,
//   Ban,
//   Unlock,
//   CheckCircle,
//   XCircle,
//   Star,
// } from "lucide-react";

// export default function GroupDetailsTab({
//   groupId,
// }: {
//   groupId: string;
// }) {

//   const token = getToken();

//   const [group, setGroup] = useState<any>(null);

//   const [members, setMembers] = useState<any[]>([]);

//   const [currentUserId, setCurrentUserId] =
//     useState("");

//   const [loading, setLoading] =
//     useState(true);

//   const [processingId, setProcessingId] =
//     useState("");

//   async function loadGroup() {

//     try {

//       setLoading(true);

//       const res =
//         await fetch(
//           `/api/groups/details?groupId=${groupId}`,
//           {
//             headers: {
//               Authorization:
//                 `Bearer ${token}`,
//             },
//           }
//         );

//       const data =
//         await res.json();

//       setGroup(data.group);

//       setMembers(data.members);

//       const meRes =
//         await fetch(
//           "/api/user/me",
//           {
//             headers: {
//               Authorization:
//                 `Bearer ${token}`,
//             },
//           }
//         );

//       const me =
//         await meRes.json();

//       setCurrentUserId(me._id);

//     }
//     catch {

//       toast.error(
//         "Failed to load group"
//       );

//     }
//     finally {

//       setLoading(false);

//     }

//   }

//   useEffect(() => {

//     loadGroup();

//   }, [groupId]);

//   function copyInviteCode() {

//     navigator.clipboard.writeText(
//       group.inviteCode
//     );

//     toast.success(
//       "Invite code copied"
//     );

//   }

//   async function updateMember(
//     memberId: string,
//     action: string
//   ) {

//     try {

//       setProcessingId(memberId);

//       const res =
//         await fetch(
//           "/api/groups/update-member",
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type":
//                 "application/json",
//             },
//             body: JSON.stringify({
//               token,
//               groupId,
//               memberId,
//               action,
//             }),
//           }
//         );

//       const data =
//         await res.json();

//       if (!res.ok)
//         throw new Error(data.error);

//       toast.success(
//         "Member updated"
//       );

//       loadGroup();

//     }
//     catch (err: any) {

//       toast.error(
//         err.message ||
//         "Failed to update member"
//       );

//     }
//     finally {

//       setProcessingId("");

//     }

//   }

//   async function leaveGroup() {

//     try {

//       await fetch(
//         "/api/groups/leave",
//         {
//           method: "DELETE",
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

//       toast.success(
//         "You left the group"
//       );

//       location.reload();

//     }
//     catch {

//       toast.error(
//         "Failed to leave group"
//       );

//     }

//   }

//   if (loading)
//     return (

//       <div className="flex justify-center py-20">

//         <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />

//       </div>

//     );

//   const isOwner =
//     group.ownerId === currentUserId;

//   return (

//     <div className="space-y-6">

//       {/* HEADER */}
//       <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm flex justify-between items-center">

//         <div>

//           <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">

//             <Users className="w-6 h-6" />

//             {group.name}

//           </h1>

//           <div className="text-sm text-[#6b7280] mt-1">

//             {members.length} members

//           </div>

//         </div>

//         {!isOwner && (

//           <button
//             onClick={leaveGroup}
//             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//           >

//             <LogOut className="w-4 h-4" />

//             Leave Group

//           </button>

//         )}

//       </div>

//       {/* INVITE CODE */}
//       <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm">

//         <div className="font-semibold mb-3">

//           Invite Code

//         </div>

//         <div className="flex gap-3">

//           <div className="bg-[#e0f2f1] text-[#0f766e] px-4 py-2 rounded-lg font-mono">

//             {group.inviteCode}

//           </div>

//           <button
//             onClick={copyInviteCode}
//             className="bg-[#0f766e] hover:bg-[#0b5e58] text-white px-4 py-2 rounded-lg flex items-center gap-2"
//           >

//             <Copy className="w-4 h-4" />

//             Copy

//           </button>

//         </div>

//       </div>

//       {/* MEMBERS */}
//       <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm">

//         <div className="font-semibold mb-4">

//           Members

//         </div>

//         <div className="space-y-3">

//           {members.map((member: any) => {

//             const isBlocked =
//               member.status === "blocked";

//             const isPending =
//               member.status === "pending";

//             const isApproved =
//               member.status === "approved";

//             return (

//               <div
//                 key={member._id}
//                 className={`
//                   flex justify-between items-center p-3 border rounded-lg
//                   ${isBlocked
//                     ? "border-red-300 bg-red-50"
//                     : "border-[#b2dfdb]"
//                   }
//                 `}
//               >

//                 {/* LEFT */}
//                 <div className="flex items-center gap-3">

//                   <img
//                     src={
//                       member.userId.profilePhoto ||
//                       `https://ui-avatars.com/api/?name=${member.userId.name}`
//                     }
//                     className="w-10 h-10 rounded-full border border-[#b2dfdb]"
//                   />

//                   <div>

//                     <div className="font-medium flex items-center gap-2">

//                       {member.userId.name}

//                       {isBlocked && (

//                         <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">

//                           BLOCKED

//                         </span>

//                       )}

//                       {isPending && (

//                         <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">

//                           PENDING

//                         </span>

//                       )}

//                     </div>

//                     <div className="flex gap-2 mt-1 text-xs">

//                       <span className="bg-[#e0f2f1] text-[#0f766e] px-2 py-0.5 rounded flex items-center gap-1">

//                         {member.role === "owner"
//                           ? <Crown className="w-3 h-3" />
//                           : <Shield className="w-3 h-3" />
//                         }

//                         {member.role}

//                       </span>

//                       <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">

//                         <Eye className="w-3 h-3" />

//                         {member.accessLevel}

//                       </span>

//                     </div>

//                   </div>

//                 </div>

//                 {/* ACTIONS */}
//                 {isOwner &&
//                   member.role !== "owner" && (

//                   <div className="flex gap-2 flex-wrap justify-end">

//                     {/* BLOCK / UNBLOCK */}
//                     {isBlocked ? (

//                       <button
//                         onClick={() =>
//                           updateMember(member._id, "unblock")
//                         }
//                         disabled={processingId === member._id}
//                         className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                       >

//                         {processingId === member._id
//                           ? <Loader2 className="w-3 h-3 animate-spin" />
//                           : <Unlock className="w-3 h-3" />
//                         }

//                         Unblock

//                       </button>

//                     ) : (

//                       <button
//                         onClick={() =>
//                           updateMember(member._id, "block")
//                         }
//                         disabled={processingId === member._id}
//                         className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                       >

//                         <Ban className="w-3 h-3" />

//                         Block

//                       </button>

//                     )}

//                     {/* APPROVE / REJECT */}
//                     {isPending && (

//                       <>
//                         <button
//                           onClick={() =>
//                             updateMember(member._id, "approve")
//                           }
//                           className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                         >

//                           <CheckCircle className="w-3 h-3" />

//                           Approve

//                         </button>

//                         <button
//                           onClick={() =>
//                             updateMember(member._id, "reject")
//                           }
//                           className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                         >

//                           <XCircle className="w-3 h-3" />

//                           Reject

//                         </button>
//                       </>

//                     )}

//                     {/* ROLE */}
//                     {isApproved && !isBlocked && (

//                       <button
//                         onClick={() =>
//                           updateMember(
//                             member._id,
//                             member.role === "contributor"
//                               ? "makeViewer"
//                               : "makeContributor"
//                           )
//                         }
//                         className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                       >

//                         <UserCog className="w-3 h-3" />

//                         {member.role === "contributor"
//                           ? "Make Viewer"
//                           : "Make Contributor"
//                         }

//                       </button>

//                     )}

//                     {/* ACCESS */}
//                     {isApproved && !isBlocked && (

//                       <button
//                         onClick={() =>
//                           updateMember(
//                             member._id,
//                             member.accessLevel === "full"
//                               ? "downgradeAccess"
//                               : "upgradeAccess"
//                           )
//                         }
//                         className="bg-[#0f766e] hover:bg-[#0b5e58] text-white px-3 py-1 rounded text-xs flex items-center gap-1"
//                       >

//                         <Star className="w-3 h-3" />

//                         {member.accessLevel === "full"
//                           ? "Partial Access"
//                           : "Full Access"
//                         }

//                       </button>

//                     )}

//                   </div>

//                 )}

//               </div>

//             );

//           })}

//         </div>

//       </div>

//       {/* UPLOAD */}
//       <UploadPhotoTab groupId={groupId} />

//       {/* PHOTOS */}
//       <GroupPhotosTab groupId={groupId} />

//     </div>

//   );

// }




"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import UploadPhotoTab from "@/components/UploadPhotoTab";
import GroupPhotosTab from "@/components/GroupPhotosTab";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

import {
  Users,
  Copy,
  LogOut,
  Shield,
  Eye,
  Crown,
  Loader2,
  UserCog,
  Ban,
  Unlock,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
} from "lucide-react";

export default function GroupDetailsTab({
  groupId,
}: {
  groupId: string;
}) {

  const token = getToken();

  const [group, setGroup] = useState<any>(null);

  const [members, setMembers] = useState<any[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState("");

  // NEW delete states
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  async function loadGroup() {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setLoading(true);

      const res =
        await fetch(
          `/api/groups/details?groupId=${groupId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
        
      const data =
        await res.json();

      setGroup(data.group);

      setMembers(data.members);

      const meRes =
        await fetch(
          "/api/user/me",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const me =
        await meRes.json();

      setCurrentUserId(me._id);

    }
    catch {

      toast.error(
        "Failed to load group"
      );

    }
    finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadGroup();

  }, [groupId]);

  function copyInviteCode() {

    navigator.clipboard.writeText(
      group.inviteCode
    );

    toast.success(
      "Invite code copied"
    );

  }

  async function updateMember(
    memberId: string,
    action: string
  ) {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setProcessingId(memberId);

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
            body: JSON.stringify({
              groupId,
              memberId,
              action,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok)
        throw new Error(data.error);

      toast.success(
        "Member updated"
      );

      loadGroup();

    }
    catch (err: any) {

      toast.error(
        err.message ||
        "Failed to update member"
      );

    }
    finally {

      setProcessingId("");

    }

  }

  async function leaveGroup() {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      await fetch(
        "/api/groups/leave",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            groupId,
          }),
        }
      );

      toast.success(
        "You left the group"
      );

      location.reload();

    }
    catch {

      toast.error(
        "Failed to leave group"
      );

    }

  }

  // NEW delete function
  async function handleDeleteGroup() {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setDeleting(true);

      const res =
        await fetch(
          "/api/groups/delete",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              groupId,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok)
        throw new Error(data.error);

      toast.success(
        "Group deleted successfully"
      );

      location.reload();

    }
    catch (err: any) {

      toast.error(
        err.message ||
        "Failed to delete group"
      );

    }
    finally {

      setDeleting(false);

    }

  }

  if (loading)
    return (

      <div className="flex justify-center py-20">

        <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />

      </div>

    );

  const isOwner =
    group.ownerId === currentUserId;

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">

            <Users className="w-6 h-6" />

            {group.name}

          </h1>

          <div className="text-sm text-[#6b7280] mt-1">

            {members.length} members

          </div>

        </div>

        <div className="flex gap-2">

          {!isOwner && (

            <button
              onClick={leaveGroup}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >

              <LogOut className="w-4 h-4" />

              Leave Group

            </button>

          )}

          {isOwner && (

            <button
              onClick={() =>
                setShowDeleteModal(true)
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >

              <Trash2 className="w-4 h-4" />

              Delete Group

            </button>

          )}

        </div>

      </div>

      {/* INVITE CODE */}
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm">

        <div className="font-semibold mb-3">

          Invite Code

        </div>

        <div className="flex gap-3">

          <div className="bg-[#e0f2f1] text-[#0f766e] px-4 py-2 rounded-lg font-mono">

            {group.inviteCode}

          </div>

          <button
            onClick={copyInviteCode}
            className="bg-[#0f766e] hover:bg-[#0b5e58] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >

            <Copy className="w-4 h-4" />

            Copy

          </button>

        </div>

      </div>

      {/* MEMBERS */}
      <div className="bg-white border border-[#b2dfdb] rounded-xl p-6 shadow-sm">

        <div className="font-semibold mb-4">

          Members

        </div>

        <div className="space-y-3">

          {members.map((member: any) => {
            const memberUser =
              member.user ||
              member.userId ||
              {};

            const isBlocked =
              member.status === "blocked";

            const isPending =
              member.status === "pending";

            const isApproved =
              member.status === "approved";

            return (

              <div
                key={member._id}
                className={`flex justify-between items-center p-3 border rounded-lg ${
                  isBlocked
                    ? "border-red-300 bg-red-50"
                    : "border-[#b2dfdb]"
                }`}
              >

                {/* LEFT */}
                <div className="flex items-center gap-3">

                  <img
                    src={
                      memberUser.profilePhoto ||
                      `https://ui-avatars.com/api/?name=${memberUser.name || "User"}`
                    }
                    className="w-10 h-10 rounded-full border border-[#b2dfdb]"
                  />

                  <div>

                    <div className="font-medium flex items-center gap-2">

                      {memberUser.name || "Unknown User"}

                      {isBlocked && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                          BLOCKED
                        </span>
                      )}

                      {isPending && (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                          PENDING
                        </span>
                      )}

                    </div>

                    <div className="flex gap-2 mt-1 text-xs">

                      <span className="bg-[#e0f2f1] text-[#0f766e] px-2 py-0.5 rounded flex items-center gap-1">

                        {member.role === "owner"
                          ? <Crown className="w-3 h-3" />
                          : <Shield className="w-3 h-3" />
                        }

                        {member.role}

                      </span>

                      <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">

                        <Eye className="w-3 h-3" />

                        {member.accessLevel}

                      </span>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}
                {isOwner &&
                  member.role !== "owner" && (

                  <div className="flex gap-2 flex-wrap justify-end">

                    {isBlocked ? (

                      <button
                        onClick={() =>
                          updateMember(member._id, "unblock")
                        }
                        disabled={processingId === member._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >

                        {processingId === member._id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Unlock className="w-3 h-3" />
                        }

                        Unblock

                      </button>

                    ) : (

                      <button
                        onClick={() =>
                          updateMember(member._id, "block")
                        }
                        disabled={processingId === member._id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >

                        <Ban className="w-3 h-3" />

                        Block

                      </button>

                    )}

                    {isPending && (

                      <>
                        <button
                          onClick={() =>
                            updateMember(member._id, "approve")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                        >

                          <CheckCircle className="w-3 h-3" />

                          Approve

                        </button>

                        <button
                          onClick={() =>
                            updateMember(member._id, "reject")
                          }
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                        >

                          <XCircle className="w-3 h-3" />

                          Reject

                        </button>
                      </>

                    )}

                    {isApproved && !isBlocked && (

                      <button
                        onClick={() =>
                          updateMember(
                            member._id,
                            member.role === "contributor"
                              ? "makeViewer"
                              : "makeContributor"
                          )
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >

                        <UserCog className="w-3 h-3" />

                        {member.role === "contributor"
                          ? "Make Viewer"
                          : "Make Contributor"
                        }

                      </button>

                    )}

                    {isApproved && !isBlocked && (

                      <button
                        onClick={() =>
                          updateMember(
                            member._id,
                            member.accessLevel === "full"
                              ? "downgradeAccess"
                              : "upgradeAccess"
                          )
                        }
                        className="bg-[#0f766e] hover:bg-[#0b5e58] text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >

                        <Star className="w-3 h-3" />

                        {member.accessLevel === "full"
                          ? "Partial Access"
                          : "Full Access"
                        }

                      </button>

                    )}

                  </div>

                )}

              </div>

            );

          })}

        </div>

      </div>

      <UploadPhotoTab groupId={groupId} />

      <GroupPhotosTab groupId={groupId} />

      {showDeleteModal && (

        <DeleteConfirmationModal
          title="Delete Group"
          message="This will permanently delete this group and all members and photos."
          loading={deleting}
          onCancel={() =>
            setShowDeleteModal(false)
          }
          onConfirm={handleDeleteGroup}
        />

      )}

    </div>

  );

}
