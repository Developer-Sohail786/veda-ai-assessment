"use client";

import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isCompactSidebar =
    pathname.startsWith("/exams/processing") ||
    pathname.startsWith("/exams/result");

  return (
    <div className="flex h-dvh w-full gap-4 bg-transparent p-2 md:p-4">
      <Sidebar
        key={isCompactSidebar ? "collapsed" : "expanded"}
        defaultCollapsed={isCompactSidebar}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <TopBar
          title="Exams"
          titleIcon={<ClipboardList className="h-4 w-4" />}
          backHref="/exams"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}