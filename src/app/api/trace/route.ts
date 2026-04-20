import { NextRequest } from "next/server";
import { traceBackward } from "@/lib/trace";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const entity = searchParams.get("entity") as "task" | "order" | "spec" | null;
  const id = searchParams.get("id");

  if (!entity || !id) {
    return Response.json({ error: "entity and id query params are required" }, { status: 400 });
  }
  if (!["task", "order", "spec"].includes(entity)) {
    return Response.json({ error: "entity must be task, order, or spec" }, { status: 400 });
  }

  const result = await traceBackward(entity, id);
  if (!result) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(result);
}
