import Link from "next/link";
import { type ReactNode } from "react";

interface NavigationItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

export default function NavigationItem({
  href,
  icon,
  label,
  active = false,
  collapsed = false,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`
        flex h-[40px] items-center
        gap-3
        rounded-[8px]
        px-3
        text-[15px]
        transition-colors
        ${
          collapsed
            ? "justify-center px-0"
            : ""
        }
        ${
          active
            ? "bg-[#F1F1F1] font-medium text-[#303030]"
            : "font-normal text-[#777777] hover:bg-[#F1F1F1] hover:text-[#303030]"
        }
      `}
    >
      <span
        className="
          flex h-[20px] w-[20px]
          shrink-0
          items-center justify-center
          [&>svg]:h-[19px]
          [&>svg]:w-[19px]
          [&>svg]:stroke-[1.8]
        "
      >
        {icon}
      </span>

      {!collapsed && (
        <span className="truncate leading-none">
          {label}
        </span>
      )}
    </Link>
  );
}