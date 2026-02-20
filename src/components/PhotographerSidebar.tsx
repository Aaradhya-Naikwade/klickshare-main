// "use client";

// import { useRouter } from "next/navigation";
// import { removeToken } from "@/lib/auth";

// export default function PhotographerSidebar({
//   active,
//   setActive,
// }: any) {

//   const router = useRouter();

//   function logout() {

//     removeToken();

//     router.replace("/auth");

//   }

//   const tabs = [

//     "My Profile",

//     "My Events",

//     // "Create Event",

//     "Create Group",

//     "Join New Group",

//     "Join Requests",

//     "Notifications",

//   ];

//   return (
//     <div className="p-5">

//       <div className="text-xl font-bold mb-6">
//         Klickshare
//       </div>

//       {tabs.map((tab) => (

//         <div
//           key={tab}
//           onClick={() =>
//             setActive(tab)
//           }
//           className={`p-3 rounded cursor-pointer mb-2 transition ${
//             active === tab
//               ? "bg-blue-600 text-white"
//               : "hover:bg-gray-800 text-gray-300"
//           }`}
//         >
//           {tab}
//         </div>

//       ))}

//       <div
//         onClick={logout}
//         className="p-3 mt-6 cursor-pointer bg-red-600 hover:bg-red-700 rounded text-white"
//       >
//         Logout
//       </div>

//     </div>
//   );
// }







"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

import {
  User,
  Calendar,
  Users,
  UserPlus,
  Bell,
  LogOut,
} from "lucide-react";

export default function PhotographerSidebar({
  active,
  setActive,
}: any) {
  const router = useRouter();

  function logout() {
    removeToken();
    router.replace("/auth");
  }

  const tabs = [
    { name: "My Profile", icon: User },
    { name: "My Events", icon: Calendar },
    { name: "Create Group", icon: Users },
    { name: "Join New Group", icon: UserPlus },
    { name: "Join Requests", icon: Users },
    { name: "Notifications", icon: Bell },
  ];

  return (
    <div
      className="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between p-5 border-r bg-white"
      style={{ borderColor: "#b2dfdb" }}
    >
      {/* ================= TOP ================= */}
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="text-xl font-bold mb-6 text-teal-700">
          Klickshare
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => setActive(tab.name)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium
                  transition-all relative
                  ${
                    isActive
                      ? "bg-teal-700 text-white"
                      : "text-gray-900 hover:bg-teal-50"
                  }
                `}
              >
                {/* active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />
                )}

                <Icon
                  size={18}
                  className={
                    isActive ? "text-white" : "text-teal-700"
                  }
                />

                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= LOGOUT ================= */}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 p-3 rounded-lg text-white font-medium transition-all bg-teal-700 hover:bg-teal-800"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
