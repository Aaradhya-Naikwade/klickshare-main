"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken, removeToken } from "@/lib/auth";
import { toast } from "sonner";

import UploadPhotoTab from "@/components/UploadPhotoTab";
import GroupPhotosTab from "@/components/GroupPhotosTab";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

import {
  Ban,
  CheckCircle,
  Copy,
  Crown,
  Eye,
  Loader2,
  LogOut,
  Shield,
  Star,
  Trash2,
  Unlock,
  UserCog,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";

export default function GroupDetailsTab({
  groupId,
  onBack,
  backLabel = "Back",
}: {
  groupId: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  const token = getToken();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] =
    useState<"photos" | "members" | "upload">("photos");
  const [photoCount, setPhotoCount] =
    useState(0);
  const [photosRefreshToken, setPhotosRefreshToken] =
    useState(0);

  async function loadGroup() {
    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setLoading(true);

      const res = await fetch(
        `/api/groups/details?groupId=${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load group");
      }

      setGroup(data.group);
      setMembers(data.members || []);

      const photosRes = await fetch(
        `/api/photos/group?groupId=${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (photosRes.ok) {
        const photosData =
          await photosRes.json();
        setPhotoCount(
          (photosData.photos || []).length
        );
      }

      const meRes = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meRes.ok) {
        removeToken();
        throw new Error("Please login again");
      }

      const me = await meRes.json();
      setCurrentUserId(me._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to load group");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGroup();
  }, [groupId]);

  useEffect(() => {
    setActiveTab("photos");
  }, [groupId]);

  async function copyInviteCode() {
    if (!group?.inviteCode) return;
    await navigator.clipboard.writeText(group.inviteCode);
    toast.success("Invite code copied");
  }

  async function updateMember(memberId: string, action: string) {
    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setProcessingId(memberId);

      const res = await fetch("/api/groups/update-member", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          memberId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update member");
      }

      toast.success("Member updated");
      await loadGroup();
    } catch (err: any) {
      toast.error(err.message || "Failed to update member");
    } finally {
      setProcessingId("");
    }
  }

  function handleExit() {
    if (onBack) {
      onBack();
      return;
    }

    location.reload();
  }

  async function leaveGroup() {
    try {
      if (!token) {
        throw new Error("Please login again");
      }

      const res = await fetch("/api/groups/leave", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to leave group");
      }

      toast.success("You left the group");
      handleExit();
    } catch (err: any) {
      toast.error(err.message || "Failed to leave group");
    }
  }

  async function handleDeleteGroup() {
    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setDeleting(true);

      const res = await fetch("/api/groups/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete group");
      }

      toast.success("Group deleted successfully");
      setShowDeleteModal(false);
      handleExit();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete group");
    } finally {
      setDeleting(false);
    }
  }

  const stats = useMemo(() => {
    const approved = members.filter((member) => member.status === "approved").length;
    const pending = members.filter((member) => member.status === "pending").length;
    const blocked = members.filter((member) => member.status === "blocked").length;

    return { approved, pending, blocked };
  }, [members]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center rounded-[24px] border border-[#3cc2bf]/20 bg-white px-8 py-8 shadow-sm">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#1f6563]" />
          <div className="text-sm font-medium text-slate-700">
            Loading group details...
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-600">
        We couldn&apos;t load this group right now.
      </div>
    );
  }

  const isOwner = group.ownerId === currentUserId;

  const navItems = [
    { key: "photos", label: "Photos" },
    { key: "members", label: "Members" },
    { key: "upload", label: "Upload" },
  ] as const;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                <Users className="h-5 w-5" />
              </span>
              {group.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep this group organized with quick access to members, uploads, and photos.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[#3cc2bf]/15 bg-[#f8fcfc] px-4 py-3 font-mono text-sm font-semibold tracking-[0.2em] text-slate-900">
                {group.inviteCode}
              </div>
              <button
                onClick={() => void copyInviteCode()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b]"
              >
                <Copy className="h-4 w-4" />
                Copy Code
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isOwner && (
              <button
                onClick={leaveGroup}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Leave Group
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Group
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-[#3cc2bf]/15 pt-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Members
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {members.length}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Photos
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {photoCount}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Pending
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.pending}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === item.key
                  ? "bg-[#1f6563] text-white"
                  : "bg-[#f8fcfc] text-slate-600 hover:bg-[#eef8f8]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "members" && (
        <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 border-b border-[#3cc2bf]/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Members
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Review requests, adjust roles, and control access.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3 text-sm text-slate-600">
                <span className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Approved
                </span>
                <span className="mt-1 block text-lg font-semibold text-slate-900">
                  {stats.approved}
                </span>
              </div>
              <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3 text-sm text-slate-600">
                <span className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Pending
                </span>
                <span className="mt-1 block text-lg font-semibold text-slate-900">
                  {stats.pending}
                </span>
              </div>
              <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3 text-sm text-slate-600">
                <span className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Blocked
                </span>
                <span className="mt-1 block text-lg font-semibold text-slate-900">
                  {stats.blocked}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {members.map((member: any) => {
              const memberUser = member.user || member.userId || {};
              const isBlocked = member.status === "blocked";
              const isPending = member.status === "pending";
              const isApproved = member.status === "approved";
              const isBusy = processingId === member._id;

              return (
                <div
                  key={member._id}
                  className={`rounded-[24px] border p-4 transition ${
                    isBlocked
                      ? "border-red-200 bg-red-50/60"
                      : "border-[#3cc2bf]/15 bg-[#fcfefe]"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <img
                        src={
                          memberUser.profilePhoto ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(memberUser.name || "User")}`
                        }
                        alt={memberUser.name || "Member"}
                        className="h-12 w-12 rounded-2xl border border-[#3cc2bf]/15 object-cover"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-semibold text-slate-900">
                            {memberUser.name || "Unknown User"}
                          </div>

                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                              <UserRoundX className="h-3.5 w-3.5" />
                              Pending
                            </span>
                          )}

                          {isBlocked && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                              <Ban className="h-3.5 w-3.5" />
                              Blocked
                            </span>
                          )}

                          {isApproved && !isBlocked && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <UserRoundCheck className="h-3.5 w-3.5" />
                              Approved
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#3cc2bf]/10 px-3 py-1.5 font-medium text-[#1f6563]">
                            {member.role === "owner" ? (
                              <Crown className="h-3.5 w-3.5" />
                            ) : (
                              <Shield className="h-3.5 w-3.5" />
                            )}
                            {member.role}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                            <Eye className="h-3.5 w-3.5" />
                            {member.accessLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isOwner && member.role !== "owner" && (
                      <div className="flex flex-wrap gap-2 lg:max-w-[360px] lg:justify-end">
                        {isPending && (
                          <>
                            <button
                              onClick={() => updateMember(member._id, "approve")}
                              disabled={isBusy}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              Approve
                            </button>
                            <button
                              onClick={() => updateMember(member._id, "reject")}
                              disabled={isBusy}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isBlocked ? (
                          <button
                            onClick={() => updateMember(member._id, "unblock")}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => updateMember(member._id, "block")}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Block
                          </button>
                        )}

                        {isApproved && !isBlocked && (
                          <button
                            onClick={() =>
                              updateMember(
                                member._id,
                                member.role === "contributor" ? "makeViewer" : "makeContributor"
                              )
                            }
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#3cc2bf]/20 bg-white px-3 py-2 text-xs font-medium text-[#1f6563] transition hover:bg-[#f8fcfc] disabled:opacity-60"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                            {member.role === "contributor" ? "Make Viewer" : "Make Contributor"}
                          </button>
                        )}

                        {isApproved && !isBlocked && (
                          <button
                            onClick={() =>
                              updateMember(
                                member._id,
                                member.accessLevel === "full" ? "downgradeAccess" : "upgradeAccess"
                              )
                            }
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1f6563] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#174d4b] disabled:opacity-60"
                          >
                            <Star className="h-3.5 w-3.5" />
                            {member.accessLevel === "full" ? "Partial Access" : "Full Access"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <UploadPhotoTab
          groupId={groupId}
          onUploadSuccess={() => {
            setPhotosRefreshToken((value) => value + 1);
            setActiveTab("photos");
          }}
        />
      )}

      {activeTab === "photos" && (
        <GroupPhotosTab
          groupId={groupId}
          refreshToken={photosRefreshToken}
          onPhotosLoaded={(count) => setPhotoCount(count)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          title="Delete Group"
          message="This will permanently delete this group and all members and photos."
          loading={deleting}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteGroup}
        />
      )}
    </div>
  );
}
