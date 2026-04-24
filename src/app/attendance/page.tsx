import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/utils";

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

  // Pre-build lookup structures so per-member/per-cell scans are O(1)
  const attendedSet = new Set(
    meetings.flatMap((m) =>
      m.attendance
        .filter((a) => a.status === "PRESENT" || a.status === "LATE")
        .map((a) => `${m.id}:${a.memberId}`)
    )
  );
  const recordMap = new Map(
    meetings.flatMap((m) =>
      m.attendance.map((a) => [`${m.id}:${a.memberId}`, a] as const)
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Team participation across {meetings.length} completed meeting{meetings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">No completed meetings yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide sticky left-0 bg-muted/30 min-w-36">
                  Member
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-28">
                  Rate
                </th>
                {meetings.map((m) => (
                  <th key={m.id} className="px-3 py-3 min-w-24">
                    <Link href={`/meetings/${m.id}`} className="hover:text-primary transition-colors text-xs font-medium text-muted-foreground block truncate max-w-20">
                      {m.title.slice(0, 16)}
                    </Link>
                    <div className="text-xs font-normal text-muted-foreground/60 mt-0.5">
                      {formatShortDate(m.date)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => {
                const attended = meetings.filter((m) => attendedSet.has(`${m.id}:${member.id}`)).length;
                const rate = meetings.length > 0 ? Math.round((attended / meetings.length) * 100) : 0;
                const rateColor = rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-red-400";

                return (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-sm sticky left-0 bg-background border-r">
                      {member.name}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${rateColor} rounded-full transition-all`} style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{rate}%</span>
                      </div>
                    </td>
                    {meetings.map((m) => {
                      const record = recordMap.get(`${m.id}:${member.id}`);
                      return (
                        <td key={m.id} className="px-3 py-2.5 text-center">
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

      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500" /> Present</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-400" /> Late</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-400" /> Excused</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-muted-foreground/30" /> Absent</span>
      </div>
    </div>
  );
}

function AttendanceDot({ status }: { status?: string }) {
  if (!status || status === "ABSENT") {
    return <span className="inline-block size-2.5 rounded-full bg-muted-foreground/20" title="Absent" />;
  }
  const map: Record<string, string> = {
    PRESENT: "bg-emerald-500",
    LATE:    "bg-amber-400",
    EXCUSED: "bg-blue-400",
  };
  return <span className={`inline-block size-2.5 rounded-full ${map[status] ?? "bg-muted"}`} title={status} />;
}
