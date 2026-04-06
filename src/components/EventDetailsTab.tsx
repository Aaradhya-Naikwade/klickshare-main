"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import {
  CalendarDays,
  Copy,
  FolderOpen,
  Globe,
  Lock,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

export default function EventDetailsTab({
  event,
  onOpenGroup,
}: {
  event: any;
  onOpenGroup: (groupId: string) => void;
}) {
  const [groups, setGroups] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);

  const token = getToken();

  async function loadGroups() {
    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setLoading(true);
      const res = await fetch(
        `/api/groups/by-event?eventId=${event._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load groups"
        );
      }

      setGroups(data.groups || []);
    } catch (err: any) {
      toast.error(
        err.message || "Failed to load groups"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGroups();
  }, [event._id]);

  async function copyInviteCode(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success("Invite code copied");
  }

  const publicCount = useMemo(
    () =>
      groups.filter(
        (group) => group.visibility === "public"
      ).length,
    [groups]
  );
  const privateCount = groups.length - publicCount;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                <CalendarDays className="h-5 w-5" />
              </span>
              {event.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {event.description ||
                "Manage all groups created inside this event."}
            </p>
          </div>

          <div className="rounded-2xl border border-[#3cc2bf]/15 bg-[#f8fcfc] px-4 py-3 text-sm text-slate-600">
            Created {new Date(event.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-[#3cc2bf]/15 pt-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Total Groups
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {groups.length}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Public
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {publicCount}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f8fcfc] px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Private
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {privateCount}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-[#3cc2bf]/15 pb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Groups In This Event
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Open a group to manage members, uploads, and photos.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center rounded-2xl bg-[#f8fcfc] px-6 py-5 text-slate-600">
              <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#1f6563]" />
              Loading groups...
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#3cc2bf]/25 bg-[#f8fcfc] px-6 py-12 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#1f6563]" />
            <div className="text-lg font-semibold text-slate-900">
              No groups yet
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Create the first group for this event from the Create Group tab.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => {
              const isPublic = group.visibility === "public";

              return (
                <div
                  key={group._id}
                  className="rounded-[24px] border border-[#3cc2bf]/15 bg-[#fcfefe] p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {group.name}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100">
                        {isPublic ? (
                          <Globe className="h-3.5 w-3.5 text-[#1f6563]" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-[#1f6563]" />
                        )}
                        {group.visibility}
                      </div>
                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                      <Users className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#3cc2bf]/15 bg-white p-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      Invite Code
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="truncate font-mono text-sm font-semibold text-slate-900">
                        {group.inviteCode}
                      </div>
                      <button
                        onClick={() =>
                          void copyInviteCode(group.inviteCode)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#3cc2bf]/20 bg-[#3cc2bf]/10 px-3 py-2 text-sm font-medium text-[#1f6563] transition hover:bg-[#3cc2bf]/15"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenGroup(group._id)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b]"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Open Group
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
