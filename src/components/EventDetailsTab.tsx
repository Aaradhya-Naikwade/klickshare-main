"use client";

import { useEffect, useState } from "react";

import { getToken } from "@/lib/auth";

export default function EventDetailsTab({
  event,
  onOpenGroup,
  onBack,
}: {
  event: any;
  onOpenGroup: (groupId: string) => void;
  onBack: () => void;
}) {

  const [groups, setGroups] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const token = getToken();

  async function loadGroups() {

    try {

      const res = await fetch(
        `/api/groups/by-event?eventId=${event._id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      setGroups(
        data.groups || []
      );

    } catch {

      alert(
        "Failed to load groups"
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {
    loadGroups();
  }, []);


  function copyInviteCode(
    code: string
  ) {

    navigator.clipboard.writeText(
      code
    );

    alert(
      "Invite code copied"
    );

  }

  return (
    <div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
      >
        ← Back to Events
      </button>

      {/* Event Info */}
      <div className="mb-6">

        <h1 className="text-2xl font-bold text-black">
          {event.title}
        </h1>

        {event.description && (
          <div className="text-gray-600">
            {event.description}
          </div>
        )}

      </div>

      {/* Groups */}
      {loading ? (
        <div>
          Loading groups...
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white border rounded p-6 text-gray-600">
          No groups yet.
        </div>
      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {groups.map(
            (group) => (

              <div
                key={
                  group._id
                }
                className="bg-white border rounded-xl p-6 shadow-sm"
              >

                <div className="font-semibold text-black mb-2">
                  {group.name}
                </div>

                <div className="text-sm text-gray-500 mb-3 capitalize">
                  {group.visibility}
                </div>

                {/* Invite code */}
                <div className="flex gap-2 mb-4">

                  <div className="bg-gray-100 px-3 py-1 rounded font-mono text-black text-sm">
                    {
                      group.inviteCode
                    }
                  </div>

                  <button
                    onClick={() =>
                      copyInviteCode(
                        group.inviteCode
                      )
                    }
                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Copy
                  </button>

                </div>

                {/* Open group */}
                <button
                  onClick={() =>
                    onOpenGroup(
                      group._id
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  Open Group
                </button>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}
