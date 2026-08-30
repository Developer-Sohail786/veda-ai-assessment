"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ClipboardList, Menu, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";

const MOBILE_NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: "/icons/Home.svg",
  },
  {
    href: "/classroom",
    label: "My Classroom",
    icon: "/icons/My Groups.svg",
  },
  {
    href: "/assignments",
    label: "Assignments",
    icon: "/icons/Assignments.svg",
  },
  {
    href: "/exams",
    label: "Exams",
    icon: "/icons/exams.svg",
  },
  {
    href: "/library",
    label: "My Library",
    icon: "/icons/My Library.svg",
  },
];

interface TopBarProps {
  title: string;
  titleIcon?: React.ReactNode;
  userName?: string;
  backHref?: string;
}

export default function TopBar({
  title,
  titleIcon = <ClipboardList className="h-4 w-4" />,
  userName = "Madhur Rastogi",
  backHref = "/",
}: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex h-[64px] shrink-0 items-center justify-between rounded-[16px] border-b border-[var(--color-border)] bg-white px-4 md:h-[72px] md:rounded-t-[24px] md:px-7">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Back */}
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push(backHref)}
          className="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-full
            bg-transparent
            transition-colors
            hover:bg-[#F6F6F6]
            md:bg-[#F6F6F6]
            md:hover:bg-[#eeeeee]
          "
        >
          <ArrowLeft className="h-5 w-5 text-[#303030]" strokeWidth={2} />
        </button>

        {/* Desktop title */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="flex h-6 w-6 items-center justify-center">
            {titleIcon}
          </span>

          <span className="text-[15px] font-medium text-[#55524B]">
            {title}
          </span>
        </div>

        {/* Mobile logo */}
        <div className="flex items-center md:hidden">
          <span className="text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-ink)]">
            VedaAI
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Help */}
        <button
          type="button"
          aria-label="Help"
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#F6F6F6] transition-colors hover:bg-[#eeeeee] md:flex"
        >
          <Image
            src="/icons/help.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>

       {/* Notification */}
<button
  type="button"
  aria-label="Notifications"
  className="relative h-9 w-9 bg-[url('/icons/notification.svg')] bg-contain bg-center bg-no-repeat"
>
  <span className="absolute right-[4px] top-[4px] h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-white" />
</button>

        {/* AI Toolkit */}
        <button
          type="button"
          aria-label="AI Teacher's Toolkit"
          className="hidden h-9 w-9 items-center justify-center md:flex"
        >
          <Image
            src="/icons/ai-toolkit.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
          />
        </button>

        {/* Profile */}
        <Link
          href="/settings"
          aria-label={`Open ${userName} settings`}
          className="flex h-9 items-center md:flex"
        >
          <Image
            src="/icons/profile.svg"
            alt={userName}
            width={207}
            height={44}
            className="h-9 w-auto"
          />
        </Link>

        {/* Mobile menu */}
        <IconButton
          icon={
            menuOpen ? (
              <X className="h-[19px] w-[19px]" />
            ) : (
              <Menu className="h-[20px] w-[20px]" />
            )
          }
          label={menuOpen ? "Close menu" : "Open menu"}
          className="md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        />
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full z-20 mx-2 mt-2 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-lg md:hidden">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                  active
                    ? "bg-[var(--color-panel-muted)] font-semibold"
                    : "font-medium text-[var(--color-ink-soft)]"
                }`}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />

                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
