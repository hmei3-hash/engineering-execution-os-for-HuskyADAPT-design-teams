import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      sourceMeeting: true,
      sourceDecision: { include: { meeting: true } },
      sourceSpec: true,
      sourceTask: true,
    },
  });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (body.orderedAt) body.orderedAt = new Date(body.orderedAt);
  if (body.receivedAt) body.receivedAt = new Date(body.receivedAt);
  const order = await prisma.order.update({ where: { id }, data: body });
  return Response.json(order);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
