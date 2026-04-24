"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  CheckSquare,
  Package,
  UserCheck,
  Users,
  Network,
  BookOpen,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard",   Icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings",    Icon: CalendarDays },
  { href: "/specs",    label: "Design Specs",Icon: FileText },
  { href: "/tasks",    label: "Tasks",       Icon: CheckSquare },
  { href: "/orders",   label: "Orders",      Icon: Package },
  { href: "/attendance",label: "Attendance", Icon: UserCheck },
  { href: "/members",  label: "Members",     Icon: Users },
  { href: "/trace",    label: "Trace",       Icon: Network },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 flex flex-col h-full border-r" style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}>
      {/* Brand */}
      <div className="px-4 py-5 flex items-center gap-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="size-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white shadow-lg" style={{ background: "var(--sidebar-primary)" }}>
          HA
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight" style={{ color: "var(--sidebar-foreground)" }}>HuskyADAPT</p>
          <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>Engineering OS</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150",
                active ? "font-medium text-white shadow-sm" : "hover:text-white/90"
              )}
              style={
                active
                  ? { background: "var(--sidebar-primary)", color: "white" }
                  : { color: "oklch(1 0 0 / 0.5)" }
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t space-y-1" style={{ borderColor: "var(--sidebar-border)" }}>
        <ThemeToggle />
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs" style={{ color: "oklch(1 0 0 / 0.2)" }}>
          <BookOpen className="size-3" />
          <span>⌃⇧H — Handbook Copilot</span>
        </div>
      </div>
    </aside>
  );
}
