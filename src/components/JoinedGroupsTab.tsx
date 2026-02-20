

"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import {
  Users,
  RefreshCw,
  Shield,
  Eye,
  Loader2,
  FolderOpen,
} from "lucide-react";

export default function JoinedGroupsTab({
  onOpenGroup,
}: {
  onOpenGroup?: (groupId: string) => void;
}) {

  const [groups, setGroups] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const token = getToken();

  async function loadGroups(
    showRefresh = false
  ) {

    try {

      if (showRefresh)
        setRefreshing(true);
      else
        setLoading(true);

      const res = await fetch(
        "/api/groups/my-groups",
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
          data.error ||
          "Failed to load groups"
        );
      }

      setGroups(data.groups || []);

      if (showRefresh)
        toast.success(
          "Groups refreshed"
        );

    } catch (err: any) {

      setError(err.message);

      toast.error(
        err.message
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }

  useEffect(() => {
    loadGroups();
  }, []);

  // LOADING STATE
  if (loading)
    return (

      <div className="flex justify-center py-20">

        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">

          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />

          <div className="font-medium text-[#111827]">
            Loading your groups...
          </div>

        </div>

      </div>

    );

  // ERROR STATE
  if (error)
    return (

      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">

        {error}

      </div>

    );

  // EMPTY STATE
  if (groups.length === 0)
    return (

      <div className="bg-white border border-[#b2dfdb] rounded-xl p-10 text-center shadow-sm">

        <Users className="w-10 h-10 text-[#0f766e] mx-auto mb-3" />

        <div className="font-semibold text-[#111827]">
          No groups joined yet
        </div>

        <div className="text-sm text-[#6b7280] mt-1">
          Join a group to start viewing photos
        </div>

      </div>

    );

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">

            <Users className="w-6 h-6" />

            Joined Groups

          </h1>

          <p className="text-sm text-[#6b7280] mt-1">
            Groups you are a member of
          </p>

        </div>

        <button
          onClick={() =>
            loadGroups(true)
          }
          disabled={refreshing}
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

          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}

          Refresh

        </button>

      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {groups.map((item) => {

          const group = item.group;

          return (

            <div
              key={item.membershipId}
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

              {/* GROUP ICON */}
              <div className="bg-[#e0f2f1] w-12 h-12 rounded-lg flex items-center justify-center mb-4">

                <Users className="text-[#0f766e]" />

              </div>

              {/* NAME */}
              <div className="text-lg font-semibold text-[#111827] mb-2">

                {group.name}

              </div>

              {/* ROLE BADGE */}
              <div className="flex items-center gap-2 text-sm mb-1">

                <Shield className="w-4 h-4 text-[#0f766e]" />

                <span className="bg-[#e0f2f1] text-[#0f766e] px-2 py-0.5 rounded text-xs capitalize">

                  {item.role}

                </span>

              </div>

              {/* ACCESS BADGE */}
              <div className="flex items-center gap-2 text-sm mb-3">

                <Eye className="w-4 h-4 text-[#0f766e]" />

                <span className="bg-gray-100 text-[#111827] px-2 py-0.5 rounded text-xs capitalize">

                  {item.accessLevel}

                </span>

              </div>

              {/* DATE */}
              <div className="text-xs text-[#6b7280] mb-4">

                Joined {" "}
                {new Date(
                  item.joinedAt
                ).toLocaleDateString()}

              </div>

              {/* BUTTON */}
              <button
                onClick={() =>
                  onOpenGroup?.(
                    group._id
                  )
                }
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
                "
              >

                <FolderOpen className="w-4 h-4" />

                Open Group

              </button>

            </div>

          );

        })}

      </div>

    </div>

  );

}
