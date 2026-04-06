"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

import DashboardLayout from "@/components/DashboardLayout";
import PhotographerSidebar from "@/components/PhotographerSidebar";

import ProfileTab from "@/components/ProfileTab";
import MyEventsTab from "@/components/MyEventsTab";
import CreateGroupTab from "@/components/CreateGroupTab";
import JoinGroupTab from "@/components/JoinGroupTab";
import JoinRequestsTab from "@/components/JoinRequestsTab";

import EventDetailsTab from "@/components/EventDetailsTab";
import GroupDetailsTab from "@/components/GroupDetailsTab";

import NotificationsTab from "@/components/NotificationsTab";
import TransactionsTab from "@/components/TransactionsTab";

import CaptureProfilePhoto from "@/components/CaptureProfilePhoto";

const EVENT_SNAPSHOT_STORAGE_KEY =
  "photographer-dashboard-event-snapshots";

type EventSnapshot = {
  _id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

function getEventSnapshots(): Record<string, EventSnapshot> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(
      EVENT_SNAPSHOT_STORAGE_KEY
    );

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEventSnapshot(event: EventSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  const snapshots = getEventSnapshots();
  snapshots[event._id] = event;
  sessionStorage.setItem(
    EVENT_SNAPSHOT_STORAGE_KEY,
    JSON.stringify(snapshots)
  );
}

function parseHash(hash: string) {
  const value = hash.startsWith("#")
    ? hash.slice(1)
    : hash;
  const params = new URLSearchParams(value);

  return {
    eventId: params.get("event"),
    groupId: params.get("group"),
  };
}

function buildEventHash(eventId: string) {
  return `event=${eventId}`;
}

function buildGroupHash(
  eventId: string,
  groupId: string
) {
  return `event=${eventId}&group=${groupId}`;
}

export default function PhotographerDashboard() {
  const router = useRouter();
  const PHOTOGRAPHER_ACTIVE_TAB_KEY =
    "photographer-dashboard-active-tab";

  const [active, setActive] =
    useState("My Profile");
  const [user, setUser] =
    useState<any>(null);
  const [loading, setLoading] =
    useState(true);
  const [selectedEvent, setSelectedEvent] =
    useState<EventSnapshot | null>(null);
  const [selectedGroupId, setSelectedGroupId] =
    useState<string | null>(null);
  const [showCamera, setShowCamera] =
    useState(false);

  async function loadUser() {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const res = await fetch(
        "/api/user/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        removeToken();
        router.replace("/auth");
        return;
      }

      const data = await res.json();
      setUser(data);

      if (!data.profilePhoto) {
        setShowCamera(true);
      }
    } catch (error) {
      console.error(
        "Dashboard load error:",
        error
      );
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedTab = localStorage.getItem(
      PHOTOGRAPHER_ACTIVE_TAB_KEY
    );

    if (savedTab) {
      setActive(savedTab);
    }

    loadUser();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      PHOTOGRAPHER_ACTIVE_TAB_KEY,
      active
    );
  }, [active]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function syncFromHash() {
      const { eventId, groupId } = parseHash(
        window.location.hash
      );
      const snapshots = getEventSnapshots();

      if (groupId && eventId && snapshots[eventId]) {
        setSelectedEvent(snapshots[eventId]);
        setSelectedGroupId(groupId);
        return;
      }

      if (eventId && snapshots[eventId]) {
        setSelectedEvent(snapshots[eventId]);
        setSelectedGroupId(null);
        return;
      }

      setSelectedEvent(null);
      setSelectedGroupId(null);
    }

    syncFromHash();
    window.addEventListener(
      "hashchange",
      syncFromHash
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        syncFromHash
      );
    };
  }, []);

  function handleOpenEvent(event: any) {
    const eventSnapshot: EventSnapshot = {
      _id: event._id,
      title: event.title,
      description: event.description,
      createdAt: event.createdAt,
    };

    saveEventSnapshot(eventSnapshot);
    setSelectedEvent(eventSnapshot);
    setSelectedGroupId(null);

    if (typeof window !== "undefined") {
      window.location.hash = buildEventHash(
        eventSnapshot._id
      );
    }
  }

  function handleOpenGroup(groupId: string) {
    if (!selectedEvent?._id) {
      return;
    }

    saveEventSnapshot(selectedEvent);
    setSelectedGroupId(groupId);

    if (typeof window !== "undefined") {
      window.location.hash = buildGroupHash(
        selectedEvent._id,
        groupId
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-teal-200 rounded-full"></div>
          <div className="w-14 h-14 border-4 border-teal-700 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>

        <p className="mt-6 text-sm font-medium text-gray-600 animate-pulse">
          Preparing your dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500 animate-pulse">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <>
      {showCamera && (
        <CaptureProfilePhoto
          onClose={() =>
            setShowCamera(false)
          }
          onSuccess={(url: string) => {
            setUser({
              ...user,
              profilePhoto: url,
            });
            setShowCamera(false);
          }}
        />
      )}

      <DashboardLayout
        renderSidebar={({ closeMobileMenu, showHeader }) => (
          <PhotographerSidebar
            active={active}
            setActive={(tab: string) => {
              setSelectedEvent(null);
              setSelectedGroupId(null);
              setActive(tab);

              if (
                typeof window !== "undefined"
              ) {
                history.replaceState(
                  null,
                  "",
                  window.location.pathname +
                    window.location.search
                );
              }
            }}
            onNavigate={closeMobileMenu}
            showHeader={showHeader}
          />
        )}
      >
        {selectedGroupId && (
          <GroupDetailsTab
            groupId={selectedGroupId}
          />
        )}

        {!selectedGroupId &&
          selectedEvent && (
            <EventDetailsTab
              event={selectedEvent}
              onOpenGroup={handleOpenGroup}
            />
          )}

        {!selectedEvent &&
          !selectedGroupId && (
            <>
              {active === "My Profile" && (
                <ProfileTab user={user} />
              )}

              {active === "My Events" && (
                <MyEventsTab
                  onCreateGroup={handleOpenEvent}
                />
              )}

              {active === "Create Group" && (
                <CreateGroupTab />
              )}

              {active === "Join New Group" && (
                <JoinGroupTab />
              )}

              {active === "Join Requests" && (
                <JoinRequestsTab />
              )}

              {active === "Notifications" && (
                <NotificationsTab />
              )}

              {active === "Transactions" && (
                <TransactionsTab />
              )}
            </>
          )}
      </DashboardLayout>
    </>
  );
}
