import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

const hbPath = (file: string) => path.join(process.cwd(), file === "test" ? "test.md" : "hb.md");

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "hb";
  try {
    const content = await fs.readFile(hbPath(file), "utf-8");
    const lines = content.split("\n").length;
    return Response.json({ content, lines, file });
  } catch {
    return Response.json({ error: "Handbook not found" }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "hb";
  const { content } = await req.json().catch(() => ({}));
  if (!content?.trim()) return Response.json({ error: "content required" }, { status: 400 });
  const p = hbPath(file);
  const existing = await fs.readFile(p, "utf-8").catch(() => "");
  const separator = existing.trimEnd() ? "\n\n" : "";
  await fs.writeFile(p, existing.trimEnd() + separator + content.trim() + "\n");
  const updated = await fs.readFile(p, "utf-8");
  return Response.json({ success: true, lines: updated.split("\n").length });
}
