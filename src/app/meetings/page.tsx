import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { MeetingStatusBadge } from "@/components/meetings/MeetingStatusBadge";
import { formatShortDate } from "@/lib/utils";
import { Plus, CalendarDays, MessageSquare, CheckSquare, Users } from "lucide-react";

export default async function MeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    include: { _count: { select: { decisions: true, attendance: true, actionItems: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} · decisions and action items
          </p>
        </div>
        <Link href="/meetings/new">
          <Button size="sm">
            <Plus className="size-3.5" />
            New Meeting
          </Button>
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No meetings yet</p>
          <p className="text-xs text-muted-foreground mt-1">Schedule your first meeting to start capturing decisions.</p>
          <Link href="/meetings/new">
            <Button className="mt-5" variant="outline" size="sm">Schedule First Meeting</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Decisions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Actions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Attendees</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <Link href={`/meetings/${m.id}`} className="font-medium hover:text-primary transition-colors">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {formatShortDate(m.date)}
                  </td>
                  <td className="px-4 py-3.5">
                    <MeetingStatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-xs">
                      <MessageSquare className="size-3.5" />
                      {m._count.decisions}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-xs">
                      <CheckSquare className="size-3.5" />
                      {m._count.actionItems}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Users className="size-3.5" />
                      {m._count.attendance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

