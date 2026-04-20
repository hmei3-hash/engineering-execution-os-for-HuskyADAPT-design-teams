import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLUMNS = ["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
const COLUMN_LABELS: Record<string, string> = { BACKLOG: "Backlog", TODO: "To Do", IN_PROGRESS: "In Progress", BLOCKED: "Blocked", DONE: "Done" };

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { owner: true, sourceMeeting: true, sourceDecision: true, sourceSpec: true },
    orderBy: { createdAt: "desc" },
  });

  const grouped = Object.fromEntries(COLUMNS.map((c) => [c, tasks.filter((t) => t.status === c)]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">Track execution with ownership and decision linkage</p>
        </div>
        <Link href="/tasks/new"><Button>+ New Task</Button></Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div key={col} className="flex-1 min-w-52">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{COLUMN_LABELS[col]}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{grouped[col].length}</span>
            </div>
            <div className="space-y-2">
              {grouped[col].map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="rounded-lg border bg-card px-3 py-3 hover:shadow-sm transition-shadow space-y-2 cursor-pointer">
                    <p className="text-sm font-medium leading-tight">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={task.priority} />
                      {task.owner && <span className="text-xs text-muted-foreground">{task.owner.name}</span>}
                    </div>
                    {(task.sourceMeeting || task.sourceSpec || task.sourceDecision) && (
                      <p className="text-xs text-muted-foreground truncate">
                        From: {task.sourceSpec?.title ?? task.sourceDecision?.summary ?? task.sourceMeeting?.title}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </Link>
              ))}
              {grouped[col].length === 0 && (
                <div className="rounded-lg border border-dashed px-3 py-6 text-center">
                  <p className="text-xs text-muted-foreground">Empty</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = { CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700", MEDIUM: "bg-blue-100 text-blue-700", LOW: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${styles[priority] ?? styles.MEDIUM}`}>{priority}</span>;
}
