


// "use client";

// import { useRouter } from "next/navigation";
// import { removeToken } from "@/lib/auth";

// import {
//   User,
//   Users,
//   Globe,
//   UserPlus,
//   Image,
//   Download,
//   Bell,
//   LogOut,
// } from "lucide-react";

// export default function ViewerSidebar({
//   active,
//   setActive,
// }: any) {

//   const router = useRouter();

//   function logout() {
//     removeToken();
//     router.replace("/auth");
//   }

//   const tabs = [
//     {
//       name: "My Profile",
//       icon: User,
//     },
//     {
//       name: "Joined Groups",
//       icon: Users,
//     },
//     {
//       name: "Public Groups",
//       icon: Globe,
//     },
//     {
//       name: "Join New Group",
//       icon: UserPlus,
//     },
//     {
//       name: "My Photos",
//       icon: Image,
//     },
//     {
//       name: "My Downloads",
//       icon: Download,
//     },
//     {
//       name: "Notifications",
//       icon: Bell,
//     },
//   ];

//   return (
//     <div
//       className="h-full flex flex-col justify-between p-5 border-r"
//       style={{
//         backgroundColor: "#ffffff",
//         borderColor: "#b2dfdb",
//       }}
//     >

//       {/* Top Section */}
//       <div>

//         {/* Logo */}
//         <div
//           className="text-xl font-bold mb-8"
//           style={{ color: "#0f766e" }}
//         >
//           Klickshare
//         </div>

//         {/* Tabs */}
//         <div className="space-y-1">

//           {tabs.map((tab) => {

//             const Icon = tab.icon;

//             const isActive = active === tab.name;

//             return (
//               <button
//                 key={tab.name}
//                 onClick={() => setActive(tab.name)}
//                 className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all"
//                 style={{
//                   backgroundColor: isActive
//                     ? "#0f766e"
//                     : "transparent",
//                   color: isActive
//                     ? "#ffffff"
//                     : "#111827",
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!isActive) {
//                     e.currentTarget.style.backgroundColor =
//                       "#e0f2f1";
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!isActive) {
//                     e.currentTarget.style.backgroundColor =
//                       "transparent";
//                   }
//                 }}
//               >
//                 <Icon
//                   size={18}
//                   color={
//                     isActive
//                       ? "#ffffff"
//                       : "#0f766e"
//                   }
//                 />

//                 {tab.name}
//               </button>
//             );

//           })}

//         </div>

//       </div>

//       {/* Logout */}
//       <button
//         onClick={logout}
//         className="flex items-center justify-center gap-2 p-3 rounded-lg text-white font-medium transition-all"
//         style={{
//           backgroundColor: "#0f766e",
//         }}
//         onMouseEnter={(e) =>
//           (e.currentTarget.style.backgroundColor =
//             "#0b5f59")
//         }
//         onMouseLeave={(e) =>
//           (e.currentTarget.style.backgroundColor =
//             "#0f766e")
//         }
//       >
//         <LogOut size={18} />

//         Logout
//       </button>

//     </div>
//   );
// }





"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

import {
  User,
  Users,
  Globe,
  UserPlus,
  Image,
  Download,
  Bell,
  LogOut,
} from "lucide-react";

export default function ViewerSidebar({
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
    { name: "Joined Groups", icon: Users },
    { name: "Public Groups", icon: Globe },
    { name: "Join New Group", icon: UserPlus },
    { name: "My Photos", icon: Image },
    { name: "My Downloads", icon: Download },
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

        {/* Tabs (scrollable if needed) */}
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
