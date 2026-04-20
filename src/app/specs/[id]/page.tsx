import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function SpecDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spec = await prisma.designSpec.findUnique({
    where: { id },
    include: {
      sourceDecisions: { include: { meeting: true } },
      tasks: { include: { owner: true } },
      orders: true,
    },
  });
  if (!spec) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/specs" className="text-muted-foreground text-sm hover:underline">Design Specs</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm">{spec.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{spec.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Version {spec.version}</p>
        </div>
        <div className="flex items-center gap-2">
          <SpecStatusBadge status={spec.status} />
          <Link href={`/specs/${id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
        </div>
      </div>

      <Section title="Problem Statement">{spec.problemStatement}</Section>
      <Section title="Constraints">{spec.constraints}</Section>
      <Section title="Success Metrics">{spec.successMetrics}</Section>
      {spec.proposedSolution && <Section title="Proposed Solution">{spec.proposedSolution}</Section>}
      {spec.risks && <Section title="Risks">{spec.risks}</Section>}
      {spec.notes && <Section title="Notes">{spec.notes}</Section>}

      <Separator />

      {spec.sourceDecisions.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Source Decisions</h2>
          {spec.sourceDecisions.map((d) => (
            <div key={d.id} className="rounded-lg border px-4 py-3">
              <p className="text-sm font-medium">{d.summary}</p>
              <Link href={`/meetings/${d.meetingId}`} className="text-xs text-muted-foreground hover:underline">from: {d.meeting.title}</Link>
            </div>
          ))}
        </div>
      )}

      {spec.tasks.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Linked Tasks</h2>
          {spec.tasks.map((t) => (
            <Link key={t.id} href={`/tasks/${t.id}`}>
              <div className="flex items-center justify-between rounded-lg border px-4 py-2 hover:bg-accent transition-colors">
                <span className="text-sm">{t.title}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {t.owner && <span>{t.owner.name}</span>}
                  <TaskStatusBadge status={t.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {spec.orders.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Linked Orders</h2>
          {spec.orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <div className="flex items-center justify-between rounded-lg border px-4 py-2 hover:bg-accent transition-colors">
                <span className="text-sm">{o.itemName}</span>
                <span className="text-xs text-muted-foreground">{o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h2>
      <p className="text-sm whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function SpecStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline", IN_REVIEW: "default", APPROVED: "secondary", SUPERSEDED: "destructive",
  };
  return <Badge variant={variants[status] ?? "outline"}>{status.replace("_", " ")}</Badge>;
}

function TaskStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    BACKLOG: "outline", TODO: "outline", IN_PROGRESS: "default", BLOCKED: "destructive", DONE: "secondary", CANCELLED: "destructive",
  };
  return <Badge variant={variants[status] ?? "outline"} className="text-xs">{status.replace("_", " ")}</Badge>;
}
