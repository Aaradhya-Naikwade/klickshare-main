"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  renderSidebar,
  children,
}: {
  renderSidebar: (options: {
    closeMobileMenu: () => void;
    showHeader?: boolean;
  }) => React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fcfc_0%,#f2fbfa_100%)]">
      <div className="sticky top-0 z-30 border-b border-[#3cc2bf]/15 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight text-[#1f6563]">
              Klickshare
            </div>
            <p className="text-xs text-slate-500">
              Dashboard
            </p>
          </div>

          <button
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3cc2bf]/20 bg-white text-[#1f6563] transition hover:bg-[#3cc2bf]/10"
            aria-label="Toggle sidebar"
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-76px)] lg:min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#3cc2bf]/15 bg-white lg:block">
          <div className="sticky top-0 h-screen overflow-hidden">
            {renderSidebar({
              closeMobileMenu: () =>
                setMobileOpen(false),
              showHeader: true,
            })}
          </div>
        </aside>

        {mobileOpen && (
          <>
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-[#3cc2bf]/15 bg-white shadow-2xl lg:hidden">
              <div className="flex items-center justify-between border-b border-[#3cc2bf]/15 px-4 py-4">
                <div>
                  <div className="text-base font-semibold tracking-tight text-[#1f6563]">
                    Klickshare
                  </div>
                  <p className="text-xs text-slate-500">
                    Navigation
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#3cc2bf]/20 bg-white text-[#1f6563] transition hover:bg-[#3cc2bf]/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="h-[calc(100vh-73px)] overflow-hidden">
                {renderSidebar({
                  closeMobileMenu: () =>
                    setMobileOpen(false),
                  showHeader: false,
                })}
              </div>
            </aside>
          </>
        )}

        <main className="min-w-0 flex-1 p-4 text-black sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
