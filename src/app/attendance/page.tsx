import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AttendancePage() {
  const [members, meetings] = await Promise.all([
    prisma.member.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.meeting.findMany({
      where: { status: "COMPLETED" },
      include: { attendance: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const totalMeetings = meetings.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground text-sm">Team participation across {totalMeetings} completed meeting{totalMeetings !== 1 ? "s" : ""}</p>
      </div>

      {totalMeetings === 0 ? (
        <p className="text-muted-foreground text-sm">No completed meetings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium sticky left-0 bg-muted/50">Member</th>
                <th className="text-left px-4 py-3 font-medium">Rate</th>
                {meetings.map((m) => (
                  <th key={m.id} className="px-3 py-3 font-medium min-w-28">
                    <Link href={`/meetings/${m.id}`} className="hover:underline text-xs">{m.title.slice(0, 18)}</Link>
                    <div className="text-xs font-normal text-muted-foreground">{new Date(m.date).toLocaleDateString()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => {
                const attended = meetings.filter((m) => m.attendance.some((a) => a.memberId === member.id && (a.status === "PRESENT" || a.status === "LATE"))).length;
                const rate = totalMeetings > 0 ? Math.round((attended / totalMeetings) * 100) : 0;
                return (
                  <tr key={member.id}>
                    <td className="px-4 py-2 font-medium sticky left-0 bg-background">{member.name}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{rate}%</span>
                      </div>
                    </td>
                    {meetings.map((m) => {
                      const record = m.attendance.find((a) => a.memberId === member.id);
                      return (
                        <td key={m.id} className="px-3 py-2 text-center">
                          <AttendanceDot status={record?.status} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AttendanceDot({ status }: { status?: string }) {
  if (!status || status === "ABSENT") return <span className="text-muted-foreground text-xs">—</span>;
  const styles: Record<string, string> = { PRESENT: "🟢", LATE: "🟡", EXCUSED: "🔵" };
  return <span title={status}>{styles[status] ?? "—"}</span>;
}
