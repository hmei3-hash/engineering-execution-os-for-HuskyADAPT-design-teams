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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  const task = await prisma.task.update({ where: { id }, data: body });
  return Response.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
