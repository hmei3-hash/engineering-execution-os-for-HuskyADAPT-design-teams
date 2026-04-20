import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decisions = await prisma.decision.findMany({
    where: { meetingId: id },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(decisions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { summary, rationale, madeBy } = body;
  if (!summary) return Response.json({ error: "summary is required" }, { status: 400 });
  const decision = await prisma.decision.create({
    data: { meetingId: id, summary, rationale, madeBy },
  });
  return Response.json(decision, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const { searchParams } = request.nextUrl;
  const decisionId = searchParams.get("decisionId");
  if (!decisionId) return Response.json({ error: "decisionId query param required" }, { status: 400 });
  await prisma.decision.delete({ where: { id: decisionId } });
  return new Response(null, { status: 204 });
}
