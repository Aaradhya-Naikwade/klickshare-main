// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function DashboardRedirect() {
//   const router = useRouter();

//   useEffect(() => {
//     async function checkRole() {
//       const token =
//         localStorage.getItem("token");

//       if (!token) {
//         router.replace("/auth");
//         return;
//       }

//       const res = await fetch(
//         "/api/user/me",
//         {
//           headers: {
//             Authorization:
//               `Bearer ${token}`,
//           },
//         }
//       );

//       const user =
//         await res.json();

//       if (user.role === "photographer") {
//         router.replace(
//           "/photographer/dashboard"
//         );
//       } else {
//         router.replace(
//           "/viewer/dashboard"
//         );
//       }
//     }

//     checkRole();
//   }, []);

//   return (
//     <div className="p-10">
//       Loading dashboard...
//     </div>
//   );
// }







"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/auth");
        return;
      }

      const res = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = await res.json();

      if (user.role === "photographer") {
        router.replace("/photographer/dashboard");
      } else {
        router.replace("/viewer/dashboard");
      }
    }

    checkRole();
  }, [router]);

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
