"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MonitorPlay,
  FileText,
  ClipboardList,
  PieChart,
  Settings,
  PanelLeft,
} from "lucide-react";

import NavigationItem from "./NavigationItem";
import SchoolCard from "./SchoolCard";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: <LayoutGrid />,
  },
  {
    href: "/classroom",
    label: "My Classroom",
    icon: <MonitorPlay />,
  },
  {
    href: "/assignments",
    label: "Assignments",
    icon: <FileText />,
  },
  {
    href: "/exams",
    label: "Exams",
    icon: <ClipboardList />,
  },
  {
    href: "/library",
    label: "My Library",
    icon: <PieChart />,
  },
];

interface SidebarProps {
  defaultCollapsed?: boolean;
}

export default function Sidebar({ defaultCollapsed = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();

  return (
    <aside
      className={`
        hidden shrink-0 flex-col
        rounded-[16px]
        bg-white
        p-6
        md:flex
        ${collapsed ? "w-[88px] items-center" : "w-[304px]"}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center
          ${collapsed ? "flex-col gap-4" : "justify-between"}
        `}
      >
        {/* VedaAI Logo */}
        <Link
          href="/"
          aria-label="VedaAI home"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/images/Veda_logo.svg"
            alt="VedaAI"
            width={40}
            height={40}
             priority
            className="h-[40px] w-[40px] object-contain"
          />

          {!collapsed && (
            <span
              className="
                text-[24px]
                font-extrabold
                leading-none
                tracking-[-0.045em]
                text-[#303030]
              "
            >
              VedaAI
            </span>
          )}
        </Link>

        {/* Collapse button */}
        {!collapsed && (
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={() => setCollapsed(true)}
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              text-[#777777]
              transition-colors
              hover:bg-[#F1F1F1]
            "
          >
            <PanelLeft
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>

      {/* AI Teacher's Toolkit */}
      <button
        type="button"
        title="AI Teacher's Toolkit"
        className={`
          mt-[52px]
          flex h-[47px]
          items-center
          rounded-full
          bg-[#303030]
          text-white
          shadow-[0_0_0_2px_#F46B3A,0_0_0_4px_#F8D8CA]
          transition-all
          hover:shadow-[0_0_0_2px_#F46B3A,0_0_0_5px_#F8D8CA]
          ${
            collapsed
              ? "w-[47px] justify-center px-0"
              : "w-full justify-center gap-2 px-4"
          }
        `}
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <Image
            src="/images/star.svg"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
        </span>

        {!collapsed && (
          <span className="text-[15px] font-medium">
            AI Teacher&apos;s Toolkit
          </span>
        )}
      </button>

      {/* Main Navigation */}
      <nav
        className={`
          flex flex-1 flex-col
          ${collapsed ? "mt-[48px] gap-2" : "mt-[48px] gap-1"}
        `}
      >
        {NAV_ITEMS.map((item) => (
          <NavigationItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div
        className={`
          flex flex-col
          ${collapsed ? "w-full items-center gap-3" : "gap-2"}
        `}
      >
        {/* Settings */}
        <NavigationItem
          href="/settings"
          icon={<Settings />}
          label="Settings"
          collapsed={collapsed}
          active={pathname.startsWith("/settings")}
        />

        {/* School */}
        <SchoolCard
          name="Delhi Public School"
          location="Bokaro Steel City"
          collapsed={collapsed}
        />

        {/* Expand button */}
        {collapsed && (
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
            className="
              mt-1
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              transition-colors
              hover:bg-[#F1F1F1]
            "
          >
            <Image
              src="/images/Chevrons right.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
          </button>
        )}
      </div>
    </aside>
  );
}