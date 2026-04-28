"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/app/actions/auth";
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
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard",    Icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings",     Icon: CalendarDays },
  { href: "/specs",    label: "Design Specs", Icon: FileText },
  { href: "/tasks",    label: "Tasks",        Icon: CheckSquare },
  { href: "/orders",   label: "Orders",       Icon: Package },
  { href: "/attendance", label: "Attendance", Icon: UserCheck },
  { href: "/members",  label: "Members",      Icon: Users },
  { href: "/trace",    label: "Trace",        Icon: Network },
];

type User = { name: string; role: string } | null;

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const initials = user
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

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
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs" style={{ color: "oklch(1 0 0 / 0.2)" }}>
          <BookOpen className="size-3" />
          <span>⌃⇧H — Handbook Copilot</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-md" style={{ background: "oklch(1 0 0 / 0.05)" }}>
            <div className="size-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: "var(--sidebar-primary)" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "oklch(1 0 0 / 0.8)" }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: "oklch(1 0 0 / 0.35)" }}>{user.role}</p>
            </div>
            <form action={logout}>
              <button type="submit" title="Sign out" className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
