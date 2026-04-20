"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Member = { id: string; name: string; role: string };
type AttendanceRecord = { memberId: string; status: string; note: string | null; member: Member };

export function AttendancePanel({
  meetingId,
  attendance: initial,
  allMembers,
}: {
  meetingId: string;
  attendance: AttendanceRecord[];
  allMembers: Member[];
}) {
  const initialMap = Object.fromEntries(initial.map((a) => [a.memberId, { status: a.status, note: a.note ?? "" }]));
  const [records, setRecords] = useState<Record<string, { status: string; note: string }>>(
    Object.fromEntries(allMembers.map((m) => [m.id, initialMap[m.id] ?? { status: "ABSENT", note: "" }]))
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const body = allMembers.map((m) => ({ memberId: m.id, status: records[m.id].status, note: records[m.id].note || undefined }));
    await fetch(`/api/meetings/${meetingId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  }

  const presentCount = Object.values(records).filter((r) => r.status === "PRESENT" || r.status === "LATE").length;

  const statusColor: Record<string, string> = { PRESENT: "text-green-600", LATE: "text-yellow-600", EXCUSED: "text-blue-600", ABSENT: "text-muted-foreground" };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Attendance ({presentCount}/{allMembers.length} present)</h2>
        <Button size="sm" variant="outline" onClick={save} disabled={loading}>{saved ? "Saved ✓" : loading ? "Saving..." : "Save Attendance"}</Button>
      </div>

      {allMembers.length === 0 ? (
        <p className="text-muted-foreground text-sm">No team members yet. <a href="/members" className="underline">Add members first.</a></p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Member</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allMembers.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{m.role}</td>
                  <td className="px-4 py-2">
                    <Select
                      value={records[m.id]?.status ?? "ABSENT"}
                      onValueChange={(v) => setRecords({ ...records, [m.id]: { ...records[m.id], status: v ?? "ABSENT" } })}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENT">Present</SelectItem>
                        <SelectItem value="LATE">Late</SelectItem>
                        <SelectItem value="EXCUSED">Excused</SelectItem>
                        <SelectItem value="ABSENT">Absent</SelectItem>
                      </SelectContent>
                    </Select>
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
