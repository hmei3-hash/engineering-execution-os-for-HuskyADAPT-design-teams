"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/meetings", label: "Meetings", icon: "📅" },
  { href: "/specs", label: "Design Specs", icon: "📐" },
  { href: "/tasks", label: "Tasks", icon: "✓" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/attendance", label: "Attendance", icon: "👥" },
  { href: "/members", label: "Members", icon: "🧑‍🤝‍🧑" },
  { href: "/trace", label: "Trace", icon: "🔍" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r bg-muted/40 flex flex-col h-full">
      <div className="px-4 py-5 border-b">
        <p className="font-bold text-sm leading-tight">HuskyADAPT</p>
        <p className="text-xs text-muted-foreground">Engineering OS</p>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
