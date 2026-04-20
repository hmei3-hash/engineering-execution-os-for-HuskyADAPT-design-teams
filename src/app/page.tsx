import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Dashboard() {
  const [meetings, tasks, orders, members] = await Promise.all([
    prisma.meeting.findMany({ orderBy: { date: "desc" }, take: 5, include: { _count: { select: { decisions: true } } } }),
    prisma.task.groupBy({ by: ["status"], _count: true }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.member.count({ where: { isActive: true } }),
  ]);

  const taskCounts = Object.fromEntries(tasks.map((t) => [t.status, t._count]));
  const openTasks = (taskCounts["TODO"] ?? 0) + (taskCounts["IN_PROGRESS"] ?? 0) + (taskCounts["BACKLOG"] ?? 0);
  const pendingOrders = orders.filter((o) => ["REQUESTED", "APPROVED", "ORDERED"].includes(o.status)).reduce((s, o) => s + o._count, 0);
  const upcomingMeetings = meetings.filter((m) => new Date(m.date) >= new Date()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">HuskyADAPT Engineering Execution OS</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Open Tasks" value={openTasks} href="/tasks" color="blue" />
        <StatCard title="Team Members" value={members} href="/members" color="green" />
        <StatCard title="Pending Orders" value={pendingOrders} href="/orders" color="orange" />
        <StatCard title="Upcoming Meetings" value={upcomingMeetings} href="/meetings" color="purple" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Meetings</h2>
        {meetings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No meetings yet. <Link href="/meetings/new" className="underline">Schedule one.</Link></p>
        ) : (
          <div className="space-y-2">
            {meetings.map((m) => (
              <Link key={m.id} href={`/meetings/${m.id}`}>
                <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-accent transition-colors">
                  <div>
                    <p className="font-medium text-sm">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{m._count.decisions} decisions</span>
                    <MeetingStatusBadge status={m.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, href, color }: { title: string; value: number; href: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function MeetingStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    SCHEDULED: "outline",
    IN_PROGRESS: "default",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
  };
  return <Badge variant={variants[status] ?? "outline"}>{status.replace("_", " ")}</Badge>;
}
