import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attendance = await prisma.attendance.findMany({
    where: { meetingId: id },
    include: { member: true },
  });
  return Response.json(attendance);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // body: Array<{ memberId, status, note? }>
  if (!Array.isArray(body)) {
    return Response.json({ error: "Expected an array" }, { status: 400 });
  }
  const results = await Promise.all(
    body.map((entry: { memberId: string; status: string; note?: string }) =>
      prisma.attendance.upsert({
        where: { meetingId_memberId: { meetingId: id, memberId: entry.memberId } },
        update: { status: entry.status as never, note: entry.note },
        create: { meetingId: id, memberId: entry.memberId, status: entry.status as never, note: entry.note },
      })
    )
  );
  return Response.json(results);
}
