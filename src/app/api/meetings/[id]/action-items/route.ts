import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { description, ownerId, dueDate, status } = body;
  if (!description) return Response.json({ error: "description is required" }, { status: 400 });
  const item = await prisma.actionItem.create({
    data: {
      meetingId: id,
      description,
      ownerId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status,
    },
    include: { owner: true },
  });
  return Response.json(item, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const body = await request.json();
  const { actionItemId, ...data } = body;
  if (!actionItemId) return Response.json({ error: "actionItemId required" }, { status: 400 });
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  const item = await prisma.actionItem.update({ where: { id: actionItemId }, data });
  return Response.json(item);
}
