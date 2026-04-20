import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const ownerId = searchParams.get("ownerId");
  const tasks = await prisma.task.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(ownerId ? { ownerId } : {}),
    },
    include: {
      owner: true,
      sourceMeeting: true,
      sourceDecision: true,
      sourceSpec: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, status, priority, dueDate, ownerId, sourceMeetingId, sourceDecisionId, sourceSpecId, sourceActionItemId } = body;
  if (!title) return Response.json({ error: "title is required" }, { status: 400 });
  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      ownerId,
      sourceMeetingId,
      sourceDecisionId,
      sourceSpecId,
      sourceActionItemId,
    },
  });
  return Response.json(task, { status: 201 });
}
