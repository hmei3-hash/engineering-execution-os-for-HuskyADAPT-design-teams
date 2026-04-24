import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { MeetingStatusBadge } from "@/components/meetings/MeetingStatusBadge";
import { formatShortDate } from "@/lib/utils";
import { CheckSquare, Users, Package, CalendarDays, ArrowRight, Plus } from "lucide-react";

export default async function Dashboard() {
  const [meetings, tasks, orders, members] = await Promise.all([
    prisma.meeting.findMany({ orderBy: { date: "desc" }, take: 5, include: { _count: { select: { decisions: true } } } }),
    prisma.task.groupBy({ by: ["status"], _count: true }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.member.count({ where: { isActive: true } }),
  ]);

  const taskCounts = Object.fromEntries(tasks.map((t) => [t.status, t._count]));
  const openTasks = (taskCounts["TODO"] ?? 0) + (taskCounts["IN_PROGRESS"] ?? 0) + (taskCounts["BACKLOG"] ?? 0);
  const pendingOrders = orders
    .filter((o) => ["REQUESTED", "APPROVED", "ORDERED"].includes(o.status))
    .reduce((s, o) => s + o._count, 0);
  const now = new Date();
  const upcomingMeetings = meetings.filter((m) => new Date(m.date) >= now).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">HuskyADAPT Engineering Execution OS</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/meetings/new">
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              Meeting
            </Button>
          </Link>
          <Link href="/tasks/new">
            <Button size="sm">
              <Plus className="size-3.5" />
              Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Open Tasks"        value={openTasks}        href="/tasks"    Icon={CheckSquare}  iconClass="text-indigo-500" bgClass="bg-indigo-50" />
        <StatCard title="Team Members"      value={members}          href="/members"  Icon={Users}        iconClass="text-emerald-500" bgClass="bg-emerald-50" />
        <StatCard title="Pending Orders"    value={pendingOrders}    href="/orders"   Icon={Package}      iconClass="text-amber-500"  bgClass="bg-amber-50" />
        <StatCard title="Upcoming Meetings" value={upcomingMeetings} href="/meetings" Icon={CalendarDays} iconClass="text-violet-500" bgClass="bg-violet-50" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Meetings</h2>
          <Link href="/meetings" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {meetings.length === 0 ? (
          <EmptyCard message="No meetings yet." action={{ label: "Schedule first meeting", href: "/meetings/new" }} />
        ) : (
          <div className="rounded-xl border overflow-hidden divide-y">
            {meetings.map((m) => (
              <Link key={m.id} href={`/meetings/${m.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors group block">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <CalendarDays className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(m.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">{m._count.decisions} decisions</span>
                  <MeetingStatusBadge status={m.status} />
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "New Meeting", href: "/meetings/new", Icon: CalendarDays, color: "text-violet-500" },
            { label: "New Task",    href: "/tasks/new",    Icon: CheckSquare,  color: "text-indigo-500" },
            { label: "New Order",   href: "/orders/new",   Icon: Package,      color: "text-amber-500" },
            { label: "New Spec",    href: "/specs/new",    Icon: Users,        color: "text-emerald-500" },
          ].map(({ label, href, Icon, color }) => (
            <Link key={href} href={href} className="rounded-xl border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 hover:border-primary/30 transition-all group block">
              <Icon className={`size-4 shrink-0 ${color}`} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, href, Icon, iconClass, bgClass,
}: {
  title: string;
  value: number;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <Link href={href} className="rounded-xl border bg-card px-4 py-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer space-y-3 block">
      <div className={`size-9 rounded-lg ${bgClass} flex items-center justify-center`}>
        <Icon className={`size-4 ${iconClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">{title}</p>
      </div>
    </Link>
  );
}

function EmptyCard({ message, action }: { message: string; action: { label: string; href: string } }) {
  return (
    <div className="rounded-xl border border-dashed px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link href={action.href}>
        <Button className="mt-4" variant="outline" size="sm">{action.label}</Button>
      </Link>
    </div>
  );
}
