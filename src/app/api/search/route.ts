import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export type SearchHit = {
  type: "task" | "order" | "spec" | "meeting" | "decision";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  url?: string; // purchase link for orders
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return Response.json([]);

  const term = q.toLowerCase();

  const [tasks, orders, specs, meetings, decisions] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { description: { contains: term } },
        ],
      },
      include: { owner: true },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { itemName: { contains: term } },
          { description: { contains: term } },
          { vendor: { contains: term } },
          { partNumber: { contains: term } },
        ],
      },
      take: 5,
    }),
    prisma.designSpec.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { problemStatement: { contains: term } },
          { proposedSolution: { contains: term } },
        ],
      },
      take: 4,
    }),
    prisma.meeting.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { agenda: { contains: term } },
          { notes: { contains: term } },
        ],
      },
      take: 3,
    }),
    prisma.decision.findMany({
      where: {
        OR: [
          { summary: { contains: term } },
          { rationale: { contains: term } },
        ],
      },
      include: { meeting: true },
      take: 4,
    }),
  ]);

  const results: SearchHit[] = [
    ...tasks.map((t) => ({
      type: "task" as const,
      id: t.id,
      title: t.title,
      subtitle: t.owner ? `${t.status.replace("_", " ")} · ${t.owner.name}` : t.status.replace("_", " "),
      href: `/tasks/${t.id}`,
      badge: t.priority,
    })),
    ...orders.map((o) => ({
      type: "order" as const,
      id: o.id,
      title: o.itemName,
      subtitle: [o.vendor, o.status].filter(Boolean).join(" · "),
      href: `/orders/${o.id}`,
      badge: o.status,
      url: o.url ?? undefined,
    })),
    ...specs.map((s) => ({
      type: "spec" as const,
      id: s.id,
      title: s.title,
      subtitle: `v${s.version} · ${s.status}`,
      href: `/specs/${s.id}`,
      badge: s.status,
    })),
    ...meetings.map((m) => ({
      type: "meeting" as const,
      id: m.id,
      title: m.title,
      subtitle: new Date(m.date).toLocaleDateString(),
      href: `/meetings/${m.id}`,
      badge: m.status,
    })),
    ...decisions.map((d) => ({
      type: "decision" as const,
      id: d.id,
      title: d.summary,
      subtitle: `from: ${d.meeting.title}`,
      href: `/meetings/${d.meetingId}`,
    })),
  ];

  return Response.json(results);
}
