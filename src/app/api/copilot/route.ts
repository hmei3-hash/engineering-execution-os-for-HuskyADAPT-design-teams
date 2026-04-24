import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `You are the HuskyADAPT engineering handbook assistant.
STRICT RULES — follow exactly:
1. Answer ONLY using the <context> sections provided. Never use outside knowledge.
2. Every factual claim must cite its source in the format: (hb.md line N) or (test.md line N).
3. If the answer is not in the context, respond with exactly: "This information is not in the handbook."
4. Do not speculate, infer beyond what is written, or fill gaps with general engineering knowledge.
5. Be concise. Use bullet points for lists.`;

function findChunks(content: string, query: string, filename: string) {
  const lines = content.split("\n");
  const terms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const scored: { score: number; start: number; end: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const score = terms.reduce((s, t) => s + (lines[i].toLowerCase().includes(t) ? 1 : 0), 0);
    if (score > 0) scored.push({ score, start: Math.max(0, i - 2), end: Math.min(lines.length, i + 6) });
  }

  const merged: { start: number; end: number }[] = [];
  for (const { start, end } of scored.sort((a, b) => b.score - a.score).slice(0, 4)) {
    const last = merged[merged.length - 1];
    if (last && start <= last.end) { last.end = Math.max(last.end, end); }
    else merged.push({ start, end });
  }

  return merged.map(({ start, end }) => ({
    text: lines.slice(start, end).join("\n"),
    cite: `${filename} line ${start + 1}${end > start + 1 ? `–${end}` : ""}`,
  }));
}

export async function POST(req: NextRequest) {
  const { query, file = "hb" } = await req.json().catch(() => ({}));
  if (!query?.trim()) return Response.json({ error: "query required" }, { status: 400 });

  const filename = file === "test" ? "test.md" : "hb.md";
  const content = await fs.readFile(path.join(process.cwd(), filename), "utf-8").catch(() => "");
  if (!content) return Response.json({ answer: "Handbook file not found.", sources: [] });

  const chunks = findChunks(content, query, filename);
  if (chunks.length === 0) {
    return Response.json({ answer: "This information is not in the handbook.", sources: [] });
  }

  const context = chunks.map((c) => `[${c.cite}]\n${c.text}`).join("\n\n---\n\n");
  const sources = chunks.map((c) => c.cite);

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({
      answer: `[No ANTHROPIC_API_KEY set — showing raw context]\n\n${chunks.map((c) => `**${c.cite}**\n${c.text}`).join("\n\n---\n\n")}`,
      sources,
      warning: "Set ANTHROPIC_API_KEY in .env.local to enable AI responses.",
    });
  }

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `<context>\n${context}\n</context>\n\nQuestion: ${query}` }],
    });
    const answer = msg.content[0].type === "text" ? msg.content[0].text : "No response.";
    return Response.json({ answer, sources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ answer: `API error: ${msg}`, sources }, { status: 502 });
  }
}
