import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      sourceMeeting: true,
      sourceDecision: true,
      sourceSpec: true,
      sourceTask: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    itemName, description, vendor, partNumber, quantity, unitCostCents, totalCostCents,
    currency, url, status, requestedBy, notes,
    sourceMeetingId, sourceDecisionId, sourceSpecId, sourceTaskId,
  } = body;
  if (!itemName) return Response.json({ error: "itemName is required" }, { status: 400 });
  const order = await prisma.order.create({
    data: {
      itemName, description, vendor, partNumber, quantity, unitCostCents, totalCostCents,
      currency, url, status, requestedBy, notes,
      sourceMeetingId, sourceDecisionId, sourceSpecId, sourceTaskId,
    },
  });
  return Response.json(order, { status: 201 });
}
