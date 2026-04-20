import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const specs = await prisma.designSpec.findMany({
    where: status ? { status: status as never } : undefined,
    include: { _count: { select: { sourceDecisions: true, tasks: true, orders: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(specs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, problemStatement, constraints, successMetrics, proposedSolution, risks, notes, status, version } = body;
  if (!title || !problemStatement || !constraints || !successMetrics) {
    return Response.json({ error: "title, problemStatement, constraints, successMetrics are required" }, { status: 400 });
  }
  const spec = await prisma.designSpec.create({
    data: { title, problemStatement, constraints, successMetrics, proposedSolution, risks, notes, status, version },
  });
  return Response.json(spec, { status: 201 });
}
