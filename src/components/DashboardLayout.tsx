"use client";

export default function DashboardLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        {sidebar}
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 p-8 text-black">
        {children}
      </div>

    </div>
  );
}
