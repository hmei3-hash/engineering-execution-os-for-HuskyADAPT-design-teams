import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AddMemberForm } from "@/components/members/AddMemberForm";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { tasksOwned: true, attendance: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Members</h1>
        <p className="text-muted-foreground text-sm">{members.length} active member{members.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <div key={m.id} className="rounded-lg border px-4 py-4 space-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{m._count.tasksOwned} tasks</p>
                <p>{m._count.attendance} meetings</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h2 className="font-semibold mb-4">Add Member</h2>
        <AddMemberForm />
      </div>
    </div>
  );
}
