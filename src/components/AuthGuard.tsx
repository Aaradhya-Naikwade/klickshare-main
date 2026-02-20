"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isLoggedIn } from "@/lib/auth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!loggedIn) {
      router.replace("/auth");
      return;
    }

    window.history.pushState(null, "", location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    return () => {
      window.onpopstate = null;
    };
  }, [loggedIn, router]);

  if (!loggedIn) return null;

  return <>{children}</>;
}
