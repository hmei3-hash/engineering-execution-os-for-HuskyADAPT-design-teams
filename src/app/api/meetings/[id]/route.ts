import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      decisions: { orderBy: { createdAt: "asc" } },
      actionItems: {
        include: { owner: true },
        orderBy: { createdAt: "asc" },
      },
      attendance: { include: { member: true } },
    },
  });
  if (!meeting) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(meeting);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (body.date) body.date = new Date(body.date);
  const meeting = await prisma.meeting.update({ where: { id }, data: body });
  return Response.json(meeting);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.meeting.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
