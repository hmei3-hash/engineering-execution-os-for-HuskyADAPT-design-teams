import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { s3GetText, s3PutText } from "@/lib/s3";

const localPath = (file: string) => path.join(process.cwd(), file === "test" ? "test.md" : "hb.md");
const s3Key = (file: string) => `handbooks/${file === "test" ? "test.md" : "hb.md"}`;
const useS3 = () => !!(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID);

async function readHandbook(file: string): Promise<string | null> {
  if (useS3()) {
    const content = await s3GetText(s3Key(file)).catch(() => null);
    if (content !== null) return content;
  }
  return fs.readFile(localPath(file), "utf-8").catch(() => null);
}

async function writeHandbook(file: string, content: string): Promise<void> {
  if (useS3()) {
    await s3PutText(s3Key(file), content);
  }
  // Always mirror to local filesystem as backup
  await fs.writeFile(localPath(file), content, "utf-8");
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "hb";
  const content = await readHandbook(file);
  if (content === null) return Response.json({ error: "Handbook not found" }, { status: 404 });
  return Response.json({ content, lines: content.split("\n").length, file, storage: useS3() ? "s3" : "local" });
}

export async function POST(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "hb";
  const { content } = await req.json().catch(() => ({}));
  if (!content?.trim()) return Response.json({ error: "content required" }, { status: 400 });

  const existing = (await readHandbook(file)) ?? "";
  const separator = existing.trimEnd() ? "\n\n" : "";
  const updated = existing.trimEnd() + separator + content.trim() + "\n";

  await writeHandbook(file, updated);
  return Response.json({ success: true, lines: updated.split("\n").length, storage: useS3() ? "s3" : "local" });
}

/** PUT: full replace (admin use) */
export async function PUT(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "hb";
  const { content } = await req.json().catch(() => ({}));
  if (!content?.trim()) return Response.json({ error: "content required" }, { status: 400 });

  await writeHandbook(file, content.trim() + "\n");
  return Response.json({ success: true, lines: content.split("\n").length, storage: useS3() ? "s3" : "local" });
}
