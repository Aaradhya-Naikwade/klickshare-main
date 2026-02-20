// "use client";

// import { useEffect, useState } from "react";

// import { getToken } from "@/lib/auth";

// export default function NotificationsTab() {

//   const token = getToken();

//   const [notifications, setNotifications] =
//     useState<any[]>([]);

//   const [loading, setLoading] =
//     useState(true);

//   async function loadNotifications() {

//     try {

//       setLoading(true);

//       const res =
//         await fetch(
//           "/api/notifications",
//           {
//             headers: {
//               Authorization:
//                 `Bearer ${token}`,
//             },
//           }
//         );

//       const data =
//         await res.json();

//       setNotifications(
//         data.notifications || []
//       );

//     } catch {

//       alert(
//         "Failed to load notifications"
//       );

//     } finally {

//       setLoading(false);

//     }

//   }

//   useEffect(() => {

//     loadNotifications();

//   }, []);

//   async function markAsRead(
//     notificationId: string
//   ) {

//     await fetch(
//       "/api/notifications/read",
//       {
//         method: "PUT",

//         headers: {
//           "Content-Type":
//             "application/json",
//         },

//         body: JSON.stringify({

//           token,

//           notificationId,

//         }),
//       }
//     );

//     loadNotifications();

//   }

//   async function markAllAsRead() {

//     await fetch(
//       "/api/notifications/read-all",
//       {
//         method: "PUT",

//         headers: {
//           "Content-Type":
//             "application/json",
//         },

//         body: JSON.stringify({

//           token,

//         }),
//       }
//     );

//     loadNotifications();

//   }

//   async function deleteNotification(
//     notificationId: string
//   ) {

//     await fetch(
//       "/api/notifications/delete",
//       {
//         method: "DELETE",

//         headers: {
//           "Content-Type":
//             "application/json",
//         },

//         body: JSON.stringify({

//           token,

//           notificationId,

//         }),
//       }
//     );

//     loadNotifications();

//   }

//   if (loading)
//     return (
//       <div className="text-black">
//         Loading notifications...
//       </div>
//     );

//   return (
//     <div className="max-w-2xl">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">

//         <h1 className="text-2xl font-bold text-black">
//           Notifications
//         </h1>

//         {notifications.length > 0 && (

//           <button
//             onClick={
//               markAllAsRead
//             }
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
//           >
//             Mark all as read
//           </button>

//         )}

//       </div>

//       {/* Empty state */}
//       {notifications.length === 0 && (

//         <div className="bg-white border rounded-lg p-6 text-center text-gray-500">

//           No notifications yet

//         </div>

//       )}

//       {/* Notification list */}
//       <div className="space-y-3">

//         {notifications.map(
//           (notification) => (

//             <div
//               key={
//                 notification._id
//               }
//               className={`border rounded-lg p-4 flex justify-between items-start transition ${
//                 notification.read
//                   ? "bg-white border-gray-200"
//                   : "bg-blue-50 border-blue-300"
//               }`}
//             >

//               {/* Left */}
//               <div>

//                 <div className="text-black font-medium">

//                   {
//                     notification.message
//                   }

//                 </div>

//                 <div className="text-xs text-gray-500 mt-1">

//                   {new Date(
//                     notification.createdAt
//                   ).toLocaleString()}

//                 </div>

//               </div>

//               {/* Right actions */}
//               <div className="flex gap-2 ml-4">

//                 {!notification.read && (

//                   <button
//                     onClick={() =>
//                       markAsRead(
//                         notification._id
//                       )
//                     }
//                     className="text-blue-600 hover:text-blue-800 text-xs"
//                   >
//                     Mark read
//                   </button>

//                 )}

//                 <button
//                   onClick={() =>
//                     deleteNotification(
//                       notification._id
//                     )
//                   }
//                   className="text-red-600 hover:text-red-800 text-xs"
//                 >
//                   Delete
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
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";

export default function NotificationsTab() {

  const token = getToken();

  const [notifications, setNotifications] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  async function loadNotifications() {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setLoading(true);

      const res =
        await fetch(
          "/api/notifications",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      setNotifications(
        data.notifications || []
      );

    } catch {

      toast.error(
        "Failed to load notifications"
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadNotifications();

  }, []);

  async function markAsRead(
    notificationId: string
  ) {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setActionLoading(
        notificationId
      );

      await fetch(
        "/api/notifications/read",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationId,
          }),
        }
      );

      toast.success(
        "Notification marked as read"
      );

      loadNotifications();

    }
    finally {

      setActionLoading(null);

    }

  }

  async function markAllAsRead() {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setActionLoading("all");

      await fetch(
        "/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      toast.success(
        "All notifications marked as read"
      );

      loadNotifications();

    }
    finally {

      setActionLoading(null);

    }

  }

  async function deleteNotification(
    notificationId: string
  ) {

    try {
      if (!token) {
        throw new Error("Please login again");
      }

      setActionLoading(
        notificationId
      );

      await fetch(
        "/api/notifications/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationId,
          }),
        }
      );

      toast.success(
        "Notification deleted"
      );

      loadNotifications();

    }
    finally {

      setActionLoading(null);

    }

  }

  // LOADING STATE
  if (loading)
    return (

      <div className="flex justify-center py-20">

        <div className="bg-white border border-[#b2dfdb] rounded-xl shadow-sm p-8 flex flex-col items-center">

          <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin mb-3" />

          <div className="font-medium text-[#111827]">
            Loading notifications...
          </div>

        </div>

      </div>

    );

  return (

    <div className="max-w-2xl space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-[#0f766e] flex items-center gap-2">

            <Bell className="w-6 h-6" />

            Notifications

          </h1>

          <p className="text-sm text-[#6b7280] mt-1">
            Stay updated with your activity
          </p>

        </div>

        {notifications.length > 0 && (

          <button
            onClick={markAllAsRead}
            disabled={
              actionLoading === "all"
            }
            className="
              bg-[#0f766e]
              hover:bg-[#0b5e58]
              text-white
              px-4 py-2
              rounded-lg
              text-sm
              flex items-center gap-2
              shadow-sm
              disabled:opacity-50
            "
          >

            {actionLoading === "all"
              ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              )
              : (
                <CheckCheck className="w-4 h-4" />
              )
            }

            Mark all as read

          </button>

        )}

      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 && (

        <div className="bg-white border border-[#b2dfdb] rounded-xl p-10 text-center shadow-sm">

          <Bell className="w-10 h-10 text-[#0f766e] mx-auto mb-3" />

          <div className="font-semibold text-[#111827]">
            No notifications yet
          </div>

          <div className="text-sm text-[#6b7280] mt-1">
            When something happens, it will appear here
          </div>

        </div>

      )}

      {/* LIST */}
      <div className="space-y-3">

        {notifications.map(
          (notification) => (

            <div
              key={
                notification._id
              }
              className={`
                bg-white
                border
                rounded-xl
                p-4
                flex
                justify-between
                items-start
                shadow-sm
                transition
                ${
                  notification.read
                    ? "border-[#b2dfdb]"
                    : "border-[#0f766e] bg-[#e0f2f1]"
                }
              `}
            >

              {/* LEFT */}
              <div>

                <div className="font-medium text-[#111827]">

                  {
                    notification.message
                  }

                </div>

                <div className="text-xs text-[#6b7280] mt-1">

                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}

                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 ml-4">

                {!notification.read && (

                  <button
                    onClick={() =>
                      markAsRead(
                        notification._id
                      )
                    }
                    className="
                      p-2
                      rounded-lg
                      hover:bg-[#e0f2f1]
                      text-[#0f766e]
                    "
                  >

                    {actionLoading ===
                      notification._id
                      ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )
                      : (
                        <Check className="w-4 h-4" />
                      )
                    }

                  </button>

                )}

                <button
                  onClick={() =>
                    deleteNotification(
                      notification._id
                    )
                  }
                  className="
                    p-2
                    rounded-lg
                    hover:bg-red-50
                    text-red-600
                  "
                >

                  <Trash2 className="w-4 h-4" />

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

}
