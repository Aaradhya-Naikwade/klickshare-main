


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import PhotographerSidebar from "@/components/PhotographerSidebar";

import ProfileTab from "@/components/ProfileTab";
import CreateEventTab from "@/components/CreateEventTab";
import MyEventsTab from "@/components/MyEventsTab";
import CreateGroupTab from "@/components/CreateGroupTab";
import JoinGroupTab from "@/components/JoinGroupTab";
import JoinRequestsTab from "@/components/JoinRequestsTab";

import EventDetailsTab from "@/components/EventDetailsTab";
import GroupDetailsTab from "@/components/GroupDetailsTab";

import NotificationsTab from "@/components/NotificationsTab";

// NEW
import CaptureProfilePhoto from "@/components/CaptureProfilePhoto";

export default function PhotographerDashboard() {

  const router = useRouter();

  const [active, setActive] =
    useState("My Profile");

  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedEvent, setSelectedEvent] =
    useState<any>(null);

  const [selectedGroupId, setSelectedGroupId] =
    useState<string | null>(null);

  // NEW CAMERA STATE
  const [showCamera, setShowCamera] =
    useState(false);

  // Load user safely
  async function loadUser() {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        router.replace("/auth");

        return;

      }

      const res =
        await fetch(
          "/api/user/me",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!res.ok) {

        localStorage.removeItem("token");

        router.replace("/auth");

        return;

      }

      const data =
        await res.json();

      setUser(data);

      // SHOW CAMERA IF NO PROFILE PHOTO
      if (!data.profilePhoto) {

        setShowCamera(true);

      }

    }
    catch (error) {

      console.error(
        "Dashboard load error:",
        error
      );

      router.replace("/auth");

    }
    finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadUser();

  }, []);

  // Navigation handlers

  function handleOpenEvent(event: any) {

    setSelectedEvent(event);

    setSelectedGroupId(null);

  }

  function handleOpenGroup(groupId: string) {

    setSelectedGroupId(groupId);

  }

  function handleBackToEvents() {

    setSelectedEvent(null);

    setSelectedGroupId(null);

  }

  function handleBackToEventDetails() {

    setSelectedGroupId(null);

  }

  // Loading state
  // if (loading)
  //   return (
  //     <div className="p-10 text-black">
  //       Loading dashboard...
  //     </div>
  //   );

  // if (!user)
  //   return (
  //     <div className="p-10 text-black">
  //       Redirecting...
  //     </div>
  //   );
  // ================= PREMIUM LOADER =================
if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Spinner */}
      <div className="relative">
        <div className="w-14 h-14 border-4 border-teal-200 rounded-full"></div>
        <div className="w-14 h-14 border-4 border-teal-700 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>

      {/* Text */}
      <p className="mt-6 text-sm font-medium text-gray-600 animate-pulse">
        Preparing your dashboard...
      </p>
    </div>
  );
}

// ================= REDIRECT FALLBACK =================
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

      {/* CAMERA POPUP */}
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
        sidebar={
          <PhotographerSidebar
            active={active}
            setActive={(tab: string) => {

              setSelectedEvent(null);

              setSelectedGroupId(null);

              setActive(tab);

            }}
          />
        }
      >

        {/* GROUP DETAILS */}
        {selectedGroupId && (

          <div>

            <button
              onClick={
                handleBackToEventDetails
              }
              className="mb-4 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
            >
              ← Back to Groups
            </button>

            <GroupDetailsTab
              groupId={
                selectedGroupId
              }
            />

          </div>

        )}

        {/* EVENT DETAILS */}
        {!selectedGroupId &&
          selectedEvent && (

          <EventDetailsTab
            event={selectedEvent}
            onOpenGroup={
              handleOpenGroup
            }
            onBack={
              handleBackToEvents
            }
          />

        )}

        {/* NORMAL TABS */}
        {!selectedEvent &&
          !selectedGroupId && (

          <>

            {active === "My Profile" && (
              <ProfileTab user={user} />
            )}

            {active === "My Events" && (
              <MyEventsTab
                onCreateGroup={
                  handleOpenEvent
                }
              />
            )}

            {active === "Create Event" && (
              <CreateEventTab />
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

          </>

        )}

      </DashboardLayout>

    </>

  );

}
