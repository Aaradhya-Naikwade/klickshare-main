
"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import DashboardSidebarShell from "@/components/DashboardSidebarShell";

import {
  User,
  Users,
  Globe,
  UserPlus,
  Image,
  Download,
  Bell,
} from "lucide-react";

export default function ViewerSidebar({
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
    { name: "Joined Groups", icon: Users },
    { name: "Public Groups", icon: Globe },
    { name: "Join New Group", icon: UserPlus },
    { name: "My Photos", icon: Image },
    { name: "My Downloads", icon: Download },
    { name: "Notifications", icon: Bell },
  ];

  return (
    <DashboardSidebarShell
      tabs={tabs}
      active={active}
      roleLabel="Viewer Dashboard"
      showHeader={showHeader}
      onSelect={(tab) => {
        setActive(tab);
        onNavigate?.();
      }}
      onLogout={logout}
    />
  );
}
