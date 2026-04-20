import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const spec = await prisma.designSpec.findUnique({
    where: { id },
    include: {
      sourceDecisions: { include: { meeting: true } },
      tasks: { include: { owner: true } },
      orders: true,
    },
  });
  if (!spec) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(spec);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const spec = await prisma.designSpec.update({ where: { id }, data: body });
  return Response.json(spec);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.designSpec.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
