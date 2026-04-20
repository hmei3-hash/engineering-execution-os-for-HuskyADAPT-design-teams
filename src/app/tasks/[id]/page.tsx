import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskStatusSelector } from "@/components/tasks/TaskStatusSelector";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { owner: true, sourceMeeting: true, sourceDecision: { include: { meeting: true } }, sourceSpec: true, sourceActionItem: { include: { meeting: true } }, orders: true },
  });
  if (!task) notFound();

  const priorityColors: Record<string, string> = { CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700", MEDIUM: "bg-blue-100 text-blue-700", LOW: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/tasks" className="text-muted-foreground text-sm hover:underline">Tasks</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm">{task.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${priorityColors[task.priority]}`}>{task.priority}</span>
          <Link href="/tasks"><Button variant="outline" size="sm">← Back</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase mb-1">Status</p>
          <TaskStatusSelector taskId={id} currentStatus={task.status} />
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase mb-1">Owner</p>
          <p>{task.owner?.name ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase mb-1">Due Date</p>
          <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</p>
        </div>
      </div>

      {task.description && (
        <div>
          <p className="text-muted-foreground text-xs uppercase mb-1">Description</p>
          <p className="text-sm whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <h2 className="font-semibold text-sm">Traceability</h2>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="font-medium">{task.title}</span>
          {task.sourceActionItem && (
            <>
              <span className="text-muted-foreground">←</span>
              <span className="px-2 py-0.5 bg-muted rounded text-xs">Action Item: {task.sourceActionItem.description}</span>
            </>
          )}
          {task.sourceSpec && (
            <>
              <span className="text-muted-foreground">←</span>
              <Link href={`/specs/${task.sourceSpec.id}`}><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:underline">Spec: {task.sourceSpec.title}</span></Link>
            </>
          )}
          {task.sourceDecision && (
            <>
              <span className="text-muted-foreground">←</span>
              <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">Decision: {task.sourceDecision.summary}</span>
            </>
          )}
          {(task.sourceMeeting || task.sourceDecision?.meeting || task.sourceActionItem?.meeting) && (
            <>
              <span className="text-muted-foreground">←</span>
              <Link href={`/meetings/${(task.sourceMeeting ?? task.sourceDecision?.meeting ?? task.sourceActionItem?.meeting)!.id}`}>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs hover:underline">
                  Meeting: {(task.sourceMeeting ?? task.sourceDecision?.meeting ?? task.sourceActionItem?.meeting)!.title}
                </span>
              </Link>
            </>
          )}
          {!task.sourceMeeting && !task.sourceDecision && !task.sourceSpec && !task.sourceActionItem && (
            <span className="text-muted-foreground text-xs">No traceability links. <Link href={`/trace?entity=task&id=${id}`} className="underline">Run trace.</Link></span>
          )}
        </div>
      </div>

      {task.orders.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Related Orders</h2>
            {task.orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`}>
                <div className="flex justify-between rounded-lg border px-4 py-2 hover:bg-accent transition-colors">
                  <span className="text-sm">{o.itemName}</span>
                  <span className="text-xs text-muted-foreground">{o.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
