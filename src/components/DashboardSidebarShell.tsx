"use client";

import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";

type SidebarTab = {
  name: string;
  icon: LucideIcon;
};

export default function DashboardSidebarShell({
  tabs,
  active,
  onSelect,
  onLogout,
  roleLabel,
  showHeader = true,
}: {
  tabs: SidebarTab[];
  active: string;
  onSelect: (tab: string) => void;
  onLogout: () => void;
  roleLabel: string;
  showHeader?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f6fbfb_100%)] text-slate-900">
      {showHeader && (
        <div className="border-b border-[#3cc2bf]/15 px-5 pb-5 pt-6">
          <div className="text-lg font-semibold tracking-tight text-[#1f6563]">
            Klickshare
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {roleLabel}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => onSelect(tab.name)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-[#1f6563] text-white shadow-[0_14px_30px_-18px_rgba(31,101,99,0.8)]"
                    : "text-slate-700 hover:bg-[#3cc2bf]/10 hover:text-[#1f6563]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isActive
                      ? "bg-white/14 text-white"
                      : "bg-[#3cc2bf]/12 text-[#1f6563]"
                  }`}
                >
                  <Icon size={18} />
                </span>

                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#3cc2bf]/15 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f6563] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#174d4b]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
