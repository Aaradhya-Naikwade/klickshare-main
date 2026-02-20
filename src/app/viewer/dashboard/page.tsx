
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import DashboardLayout from "@/components/DashboardLayout";
// import ViewerSidebar from "@/components/ViewerSidebar";

// import ProfileTab from "@/components/ProfileTab";
// import JoinGroupTab from "@/components/JoinGroupTab";
// import PublicGroupsTab from "@/components/PublicGroupsTab";
// import JoinedGroupsTab from "@/components/JoinedGroupsTab";
// import GroupDetailsTab from "@/components/GroupDetailsTab";
// import NotificationsTab from "@/components/NotificationsTab";

// import MyPhotosTab from "@/components/MyPhotosTab";

// // NEW IMPORT
// import CaptureProfilePhoto from "@/components/CaptureProfilePhoto";

// export default function ViewerDashboard() {

//     const router = useRouter();

//     const [selectedGroupId, setSelectedGroupId] =
//         useState<string | null>(null);

//     const [active, setActive] =
//         useState("My Profile");

//     const [user, setUser] =
//         useState<any>(null);

//     const [loading, setLoading] =
//         useState(true);

//     // NEW STATE
//     const [showCamera, setShowCamera] =
//         useState(false);

//     async function loadUser() {

//         try {

//             const token =
//                 localStorage.getItem("token");

//             if (!token) {

//                 router.replace("/auth");

//                 return;

//             }

//             const res =
//                 await fetch(
//                     "/api/user/me",
//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }
//                 );

//             if (!res.ok) {

//                 localStorage.removeItem("token");

//                 router.replace("/auth");

//                 return;

//             }

//             const data =
//                 await res.json();

//             setUser(data);

//             // NEW LOGIC → show camera popup if no profile photo
//             if (!data.profilePhoto) {

//                 setShowCamera(true);

//             }

//         }
//         catch (error) {

//             console.error(
//                 "Dashboard load error:",
//                 error
//             );

//             router.replace("/auth");

//         }
//         finally {

//             setLoading(false);

//         }

//     }

//     useEffect(() => {

//         loadUser();

//     }, []);

//     if (loading)
//         return (
//             <div className="p-10 text-black">
//                 Loading dashboard...
//             </div>
//         );

//     if (!user)
//         return (
//             <div className="p-10 text-black">
//                 Redirecting...
//             </div>
//         );

//     return (

//         <>

//             {/* NEW CAMERA POPUP */}
//             {showCamera && (

//                 <CaptureProfilePhoto

//                     onClose={() =>
//                         setShowCamera(false)
//                     }

//                     onSuccess={(url: string) => {

//                         // update user profile photo instantly
//                         setUser({
//                             ...user,
//                             profilePhoto: url,
//                         });

//                         setShowCamera(false);

//                     }}

//                 />

//             )}

//             <DashboardLayout
//                 sidebar={
//                     <ViewerSidebar
//                         active={active}
//                         setActive={(tab: string) => {

//                             setSelectedGroupId(null);

//                             setActive(tab);

//                         }}
//                     />
//                 }
//             >

//                 {selectedGroupId && (

//                     <GroupDetailsTab
//                         groupId={selectedGroupId}
//                     />

//                 )}

//                 {!selectedGroupId &&
//                     active === "My Profile" && (

//                         <ProfileTab user={user} />

//                     )}

//                 {!selectedGroupId &&
//                     active === "Joined Groups" && (

//                         <JoinedGroupsTab
//                             onOpenGroup={(groupId) =>
//                                 setSelectedGroupId(groupId)
//                             }
//                         />

//                     )}

//                 {!selectedGroupId &&
//                     active === "Public Groups" && (

//                         <PublicGroupsTab />

//                     )}

//                 {!selectedGroupId &&
//                     active === "Join New Group" && (
//                         <JoinGroupTab />
//                     )}

//                 {active === "My Photos" && (
//                     <MyPhotosTab />
//                 )}

//                 {!selectedGroupId &&
//                     active === "My Downloads" && (
//                         <div className="text-black">
//                             Downloads coming soon
//                         </div>

//                     )}

//                 {!selectedGroupId &&
//                     active === "Notifications" && (
//                         <NotificationsTab />
//                     )}

//             </DashboardLayout>

//         </>

//     );

// }








"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import ViewerSidebar from "@/components/ViewerSidebar";

import ProfileTab from "@/components/ProfileTab";
import JoinGroupTab from "@/components/JoinGroupTab";
import PublicGroupsTab from "@/components/PublicGroupsTab";
import JoinedGroupsTab from "@/components/JoinedGroupsTab";
import GroupDetailsTab from "@/components/GroupDetailsTab";
import NotificationsTab from "@/components/NotificationsTab";
import MyPhotosTab from "@/components/MyPhotosTab";

// CAMERA
import CaptureProfilePhoto from "@/components/CaptureProfilePhoto";

export default function ViewerDashboard() {
  const router = useRouter();

  const [selectedGroupId, setSelectedGroupId] =
    useState<string | null>(null);

  const [active, setActive] =
    useState("My Profile");

  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [showCamera, setShowCamera] =
    useState(false);

  // ================= LOAD USER =================
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
        localStorage.removeItem("token");
        router.replace("/auth");
        return;
      }

      const data = await res.json();

      setUser(data);

      // ✅ SHOW CAMERA IF NO PROFILE PHOTO
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
    loadUser();
  }, []);

  // ================= PREMIUM LOADER =================
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

  // ================= MAIN UI =================
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
          <ViewerSidebar
            active={active}
            setActive={(tab: string) => {
              setSelectedGroupId(null);
              setActive(tab);
            }}
          />
        }
      >
        {/* GROUP DETAILS */}
        {selectedGroupId && (
          <GroupDetailsTab
            groupId={selectedGroupId}
          />
        )}

        {/* NORMAL TABS */}
        {!selectedGroupId &&
          active === "My Profile" && (
            <ProfileTab user={user} />
          )}

        {!selectedGroupId &&
          active === "Joined Groups" && (
            <JoinedGroupsTab
              onOpenGroup={(groupId) =>
                setSelectedGroupId(groupId)
              }
            />
          )}

        {!selectedGroupId &&
          active === "Public Groups" && (
            <PublicGroupsTab />
          )}

        {!selectedGroupId &&
          active === "Join New Group" && (
            <JoinGroupTab />
          )}

        {active === "My Photos" && (
          <MyPhotosTab />
        )}

        {!selectedGroupId &&
          active === "My Downloads" && (
            <div className="text-black">
              Downloads coming soon
            </div>
          )}

        {!selectedGroupId &&
          active === "Notifications" && (
            <NotificationsTab />
          )}
      </DashboardLayout>
    </>
  );
}
