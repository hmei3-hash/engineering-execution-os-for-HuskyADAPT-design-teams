import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(member);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const member = await prisma.member.update({ where: { id }, data: body });
  return Response.json(member);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.member.update({ where: { id }, data: { isActive: false } });
  return new Response(null, { status: 204 });
}
