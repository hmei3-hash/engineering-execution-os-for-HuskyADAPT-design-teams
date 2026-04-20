import { prisma } from "./prisma";

export type TraceNode = {
  type: "meeting" | "decision" | "actionItem" | "spec" | "task" | "order";
  id: string;
  label: string;
  date?: string;
  href: string;
};

export type TraceResult = {
  root: TraceNode;
  chain: TraceNode[];
};

export async function traceBackward(
  entity: "task" | "order" | "spec",
  id: string
): Promise<TraceResult | null> {
  const chain: TraceNode[] = [];

  if (entity === "task") {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        sourceActionItem: { include: { meeting: true } },
        sourceDecision: { include: { meeting: true } },
        sourceMeeting: true,
        sourceSpec: true,
      },
    });
    if (!task) return null;

    const root: TraceNode = { type: "task", id: task.id, label: task.title, href: `/tasks/${task.id}` };

    if (task.sourceSpec) {
      chain.push({ type: "spec", id: task.sourceSpec.id, label: task.sourceSpec.title, href: `/specs/${task.sourceSpec.id}` });
    }
    if (task.sourceActionItem) {
      chain.push({ type: "actionItem", id: task.sourceActionItem.id, label: task.sourceActionItem.description, href: `/meetings/${task.sourceActionItem.meetingId}` });
      chain.push({ type: "meeting", id: task.sourceActionItem.meeting.id, label: task.sourceActionItem.meeting.title, date: task.sourceActionItem.meeting.date.toISOString(), href: `/meetings/${task.sourceActionItem.meeting.id}` });
    } else if (task.sourceDecision) {
      chain.push({ type: "decision", id: task.sourceDecision.id, label: task.sourceDecision.summary, href: `/meetings/${task.sourceDecision.meetingId}` });
      chain.push({ type: "meeting", id: task.sourceDecision.meeting.id, label: task.sourceDecision.meeting.title, date: task.sourceDecision.meeting.date.toISOString(), href: `/meetings/${task.sourceDecision.meeting.id}` });
    } else if (task.sourceMeeting) {
      chain.push({ type: "meeting", id: task.sourceMeeting.id, label: task.sourceMeeting.title, date: task.sourceMeeting.date.toISOString(), href: `/meetings/${task.sourceMeeting.id}` });
    }
    return { root, chain };
  }

  if (entity === "order") {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sourceTask: true,
        sourceSpec: true,
        sourceDecision: { include: { meeting: true } },
        sourceMeeting: true,
      },
    });
    if (!order) return null;

    const root: TraceNode = { type: "order", id: order.id, label: order.itemName, href: `/orders/${order.id}` };

    if (order.sourceTask) chain.push({ type: "task", id: order.sourceTask.id, label: order.sourceTask.title, href: `/tasks/${order.sourceTask.id}` });
    if (order.sourceSpec) chain.push({ type: "spec", id: order.sourceSpec.id, label: order.sourceSpec.title, href: `/specs/${order.sourceSpec.id}` });
    if (order.sourceDecision) {
      chain.push({ type: "decision", id: order.sourceDecision.id, label: order.sourceDecision.summary, href: `/meetings/${order.sourceDecision.meetingId}` });
      chain.push({ type: "meeting", id: order.sourceDecision.meeting.id, label: order.sourceDecision.meeting.title, date: order.sourceDecision.meeting.date.toISOString(), href: `/meetings/${order.sourceDecision.meeting.id}` });
    } else if (order.sourceMeeting) {
      chain.push({ type: "meeting", id: order.sourceMeeting.id, label: order.sourceMeeting.title, date: order.sourceMeeting.date.toISOString(), href: `/meetings/${order.sourceMeeting.id}` });
    }
    return { root, chain };
  }

  if (entity === "spec") {
    const spec = await prisma.designSpec.findUnique({
      where: { id },
      include: { sourceDecisions: { include: { meeting: true } } },
    });
    if (!spec) return null;

    const root: TraceNode = { type: "spec", id: spec.id, label: spec.title, href: `/specs/${spec.id}` };
    for (const d of spec.sourceDecisions) {
      chain.push({ type: "decision", id: d.id, label: d.summary, href: `/meetings/${d.meetingId}` });
      chain.push({ type: "meeting", id: d.meeting.id, label: d.meeting.title, date: d.meeting.date.toISOString(), href: `/meetings/${d.meeting.id}` });
    }
    return { root, chain };
  }

  return null;
}
