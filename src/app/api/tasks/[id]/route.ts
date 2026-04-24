import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      owner: true,
      sourceMeeting: true,
      sourceDecision: { include: { meeting: true } },
      sourceSpec: true,
      sourceActionItem: { include: { meeting: true } },
      orders: true,
    },
  });
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(task);
}

const toId = (v: unknown) => (typeof v === "string" && v ? v : null);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.title !== undefined)           data.title           = body.title;
  if (body.description !== undefined)     data.description     = body.description;
  if (body.status !== undefined)          data.status          = body.status;
  if (body.priority !== undefined)        data.priority        = body.priority;
  if (body.dueDate !== undefined)         data.dueDate         = body.dueDate ? new Date(body.dueDate) : null;
  if (body.ownerId !== undefined)         data.ownerId         = toId(body.ownerId);
  if (body.sourceMeetingId !== undefined) data.sourceMeetingId = toId(body.sourceMeetingId);
  if (body.sourceSpecId !== undefined)    data.sourceSpecId    = toId(body.sourceSpecId);
  try {
    return Response.json(await prisma.task.update({ where: { id }, data }));
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
