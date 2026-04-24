import { prisma } from "@/lib/prisma";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { CheckSquare, CalendarDays } from "lucide-react";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    where: { isActive: true },
    include: { _count: { select: { tasksOwned: true, attendance: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {members.length} active member{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const initials = m.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div key={m.id} className="rounded-xl border bg-card px-4 py-4 flex items-start gap-3">
              <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="size-3" />
                    {m._count.tasksOwned} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {m._count.attendance} meetings
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-8">
        <h2 className="font-semibold text-base mb-4">Add Member</h2>
        <AddMemberForm />
      </div>
    </div>
  );
}
