import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    include: { _count: { select: { decisions: true, attendance: true, actionItems: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground text-sm">Track decisions and action items from every meeting</p>
        </div>
        <Link href="/meetings/new"><Button>+ New Meeting</Button></Link>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No meetings yet.</p>
          <Link href="/meetings/new"><Button className="mt-4" variant="outline">Schedule First Meeting</Button></Link>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Decisions</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
                <th className="text-left px-4 py-3 font-medium">Attendees</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/meetings/${m.id}`} className="font-medium hover:underline">{m.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><MeetingStatusBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{m._count.decisions}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m._count.actionItems}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m._count.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MeetingStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    SCHEDULED: "outline", IN_PROGRESS: "default", COMPLETED: "secondary", CANCELLED: "destructive",
  };
  return <Badge variant={variants[status] ?? "outline"}>{status.replace("_", " ")}</Badge>;
}
