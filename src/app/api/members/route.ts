import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, role } = body;
  if (!name || !email || !role) {
    return Response.json({ error: "name, email, and role are required" }, { status: 400 });
  }
  const member = await prisma.member.create({ data: { name, email, role } });
  return Response.json(member, { status: 201 });
}
