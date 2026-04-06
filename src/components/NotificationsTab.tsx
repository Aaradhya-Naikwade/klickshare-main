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
  Clock3,
  Circle,
} from "lucide-react";

export default function NotificationsTab() {

  const token = getToken();

  const [notifications, setNotifications] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

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

  function formatRelativeTime(
    dateValue: string
  ) {
    const date = new Date(dateValue);
    const diffMs =
      Date.now() - date.getTime();
    const diffMinutes = Math.floor(
      diffMs / 60000
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(
      diffMinutes / 60
    );
    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(
      diffHours / 24
    );
    if (diffDays < 7) {
      return `${diffDays} day${
        diffDays > 1 ? "s" : ""
      } ago`;
    }

    return date.toLocaleDateString();
  }

  function isOlderThanDays(
    dateValue: string,
    days: number
  ) {
    const date = new Date(dateValue);
    const diffMs =
      Date.now() - date.getTime();

    return diffMs >=
      days * 24 * 60 * 60 * 1000;
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

    <div className="max-w-4xl space-y-6">

      {/* HEADER */}
      <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(31,101,99,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cc2bf]/12 text-[#1f6563]">
                <Bell className="h-5 w-5" />
              </span>
              Notifications
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Stay updated with the latest activity across your account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-fit">
            <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Total
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {notifications.length}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8fcfc] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Unread
              </div>
              <div className="mt-2 text-2xl font-semibold text-[#1f6563]">
                {unreadCount}
              </div>
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-[#3cc2bf]/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Unread notifications are highlighted for quicker review.
            </p>

            <button
              onClick={markAllAsRead}
              disabled={
                actionLoading === "all"
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b] disabled:opacity-50"
            >
              {actionLoading === "all" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 && (

        <div className="rounded-[28px] border border-[#3cc2bf]/20 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#3cc2bf]/12 text-[#1f6563]">
            <Bell className="h-7 w-7" />
          </div>

          <div className="text-lg font-semibold text-slate-900">
            No notifications yet
          </div>

          <div className="mt-2 text-sm text-slate-600">
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
                rounded-[24px]
                border
                p-5
                shadow-sm
                transition
                ${
                  notification.read
                    ? "border-[#3cc2bf]/15 bg-white"
                    : "border-[#1f6563]/20 bg-[#f2fbfb]"
                }
              `}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!notification.read && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#1f6563]/8 px-3 py-1 text-xs font-medium text-[#1f6563]">
                        <Circle className="h-2.5 w-2.5 fill-current" />
                        Unread
                      </span>
                    )}
                    {notification.read && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        Read
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-base font-medium leading-7 text-slate-900">
                    {notification.message}
                  </div>

                  <div className="mt-3 flex flex-col gap-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#1f6563]" />
                      {isOlderThanDays(
                        notification.createdAt,
                        7
                      )
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString()
                        : formatRelativeTime(
                            notification.createdAt
                          )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:ml-4 lg:justify-end">
                  {!notification.read && (
                    <button
                      onClick={() =>
                        markAsRead(
                          notification._id
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3cc2bf]/20 bg-[#3cc2bf]/10 px-3 py-2 text-sm font-medium text-[#1f6563] transition hover:bg-[#3cc2bf]/15"
                    >
                      {actionLoading ===
                      notification._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Mark read
                    </button>
                  )}

                  <button
                    onClick={() =>
                      deleteNotification(
                        notification._id
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

          )
        )}

      </div>

    </div>

  );

}
