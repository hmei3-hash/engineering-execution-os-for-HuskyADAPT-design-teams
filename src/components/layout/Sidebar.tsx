"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  CheckSquare,
  Package,
  UserCheck,
  Users,
  Network,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings", Icon: CalendarDays },
  { href: "/specs", label: "Design Specs", Icon: FileText },
  { href: "/tasks", label: "Tasks", Icon: CheckSquare },
  { href: "/orders", label: "Orders", Icon: Package },
  { href: "/attendance", label: "Attendance", Icon: UserCheck },
  { href: "/members", label: "Members", Icon: Users },
  { href: "/trace", label: "Trace", Icon: Network },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-full border-r"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <div className="px-4 py-5 flex items-center gap-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div
          className="size-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white"
          style={{ background: "var(--sidebar-primary)" }}
        >
          HA
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight" style={{ color: "var(--sidebar-foreground)" }}>
            HuskyADAPT
          </p>
          <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>
            Engineering OS
          </p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "font-medium text-white"
                  : "hover:text-white/90"
              )}
              style={
                active
                  ? { background: "var(--sidebar-primary)", color: "white" }
                  : { color: "oklch(1 0 0 / 0.5)" }
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.25)" }}>
          v0.1.0 · HuskyADAPT 2026
        </p>
      </div>
    </aside>
  );
}
