import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DecisionPanel } from "@/components/meetings/DecisionPanel";
import { ActionItemPanel } from "@/components/meetings/ActionItemPanel";
import { AttendancePanel } from "@/components/meetings/AttendancePanel";

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [meeting, allMembers] = await Promise.all([
    prisma.meeting.findUnique({
      where: { id },
      include: {
        decisions: { orderBy: { createdAt: "asc" } },
        actionItems: { include: { owner: true }, orderBy: { createdAt: "asc" } },
        attendance: { include: { member: true } },
      },
    }),
    prisma.member.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!meeting) notFound();

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-yellow-50 text-yellow-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/meetings" className="text-muted-foreground text-sm hover:underline">Meetings</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm">{meeting.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            {meeting.location && <span>· {meeting.location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[meeting.status]}`}>{meeting.status.replace("_", " ")}</span>
          <Link href={`/meetings/${id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
        </div>
      </div>

      {meeting.agenda && (
        <div>
          <h2 className="font-semibold text-sm mb-1">Agenda</h2>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{meeting.agenda}</p>
        </div>
      )}

      <Separator />

      <AttendancePanel meetingId={id} attendance={meeting.attendance} allMembers={allMembers} />

      <Separator />

      <DecisionPanel meetingId={id} decisions={meeting.decisions} />

      <Separator />

      <ActionItemPanel meetingId={id} actionItems={meeting.actionItems} members={allMembers} />
    </div>
  );
}
