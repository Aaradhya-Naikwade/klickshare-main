"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    removeToken();

    router.replace("/auth");
  }

  return (
    <button
      onClick={logout}
      className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
