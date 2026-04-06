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
import DashboardSidebarShell from "@/components/DashboardSidebarShell";

import {
  User,
  Calendar,
  Users,
  UserPlus,
  Bell,
  CreditCard,
} from "lucide-react";

export default function PhotographerSidebar({
  active,
  setActive,
  onNavigate,
  showHeader,
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
    { name: "Transactions", icon: CreditCard },
  ];

  return (
    <DashboardSidebarShell
      tabs={tabs}
      active={active}
      roleLabel="Photographer Dashboard"
      showHeader={showHeader}
      onSelect={(tab) => {
        setActive(tab);
        onNavigate?.();
      }}
      onLogout={logout}
    />
  );
}
