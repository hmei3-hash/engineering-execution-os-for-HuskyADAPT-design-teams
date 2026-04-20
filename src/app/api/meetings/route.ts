import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const meetings = await prisma.meeting.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      _count: { select: { decisions: true, attendance: true, actionItems: true } },
    },
    orderBy: { date: "desc" },
  });
  return Response.json(meetings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, date, location, agenda, notes, status } = body;
  if (!title || !date) {
    return Response.json({ error: "title and date are required" }, { status: 400 });
  }
  const meeting = await prisma.meeting.create({
    data: { title, date: new Date(date), location, agenda, notes, status },
  });
  return Response.json(meeting, { status: 201 });
}
