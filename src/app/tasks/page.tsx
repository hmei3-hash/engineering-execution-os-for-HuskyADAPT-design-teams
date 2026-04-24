import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Clock, ArrowRight } from "lucide-react";

const COLUMNS = ["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;

const COLUMN_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  BACKLOG:     { label: "Backlog",     color: "text-slate-500",  dot: "bg-slate-300" },
  TODO:        { label: "To Do",       color: "text-blue-500",   dot: "bg-blue-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-indigo-500", dot: "bg-indigo-400" },
  BLOCKED:     { label: "Blocked",     color: "text-red-500",    dot: "bg-red-400" },
  DONE:        { label: "Done",        color: "text-emerald-500",dot: "bg-emerald-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  CRITICAL: { label: "Critical", cls: "bg-red-100 text-red-700 ring-1 ring-red-200" },
  HIGH:     { label: "High",     cls: "bg-orange-100 text-orange-700 ring-1 ring-orange-200" },
  MEDIUM:   { label: "Medium",   cls: "bg-blue-100 text-blue-700 ring-1 ring-blue-200" },
  LOW:      { label: "Low",      cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" },
};

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
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · ownership and decision linkage
          </p>
        </div>
        <Link href="/tasks/new">
          <Button size="sm">
            <Plus className="size-3.5" />
            New Task
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {COLUMNS.map((col) => {
          const { label, color, dot } = COLUMN_CONFIG[col];
          const items = grouped[col];
          return (
            <div key={col} className="flex-1 min-w-52 max-w-72">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${dot}`} />
                  <h3 className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{label}</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-medium">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((task) => {
                  const source = task.sourceSpec?.title ?? task.sourceDecision?.summary ?? task.sourceMeeting?.title;
                  const { label: pLabel, cls: pCls } = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;
                  return (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="rounded-xl border bg-card px-3 py-3 hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer space-y-2.5 group">
                        <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${pCls}`}>{pLabel}</span>
                          {task.owner && (
                            <span className="text-xs text-muted-foreground truncate max-w-20">{task.owner.name}</span>
                          )}
                        </div>
                        {source && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <ArrowRight className="size-3 shrink-0" />
                            {source}
                          </p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3 shrink-0" />
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed px-3 py-8 text-center">
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
