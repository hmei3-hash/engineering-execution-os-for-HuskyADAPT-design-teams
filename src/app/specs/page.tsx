import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function SpecsPage() {
  const specs = await prisma.designSpec.findMany({
    include: { _count: { select: { sourceDecisions: true, tasks: true, orders: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Design Specs</h1>
          <p className="text-muted-foreground text-sm">Engineering intent, constraints, and success metrics</p>
        </div>
        <Link href="/specs/new"><Button>+ New Spec</Button></Link>
      </div>

      {specs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No design specs yet.</p>
          <Link href="/specs/new"><Button className="mt-4" variant="outline">Create First Spec</Button></Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {specs.map((s) => (
            <Link key={s.id} href={`/specs/${s.id}`}>
              <div className="rounded-lg border px-4 py-4 hover:bg-accent transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{s.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">v{s.version}</span>
                    <SpecStatusBadge status={s.status} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{s.problemStatement}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{s._count.sourceDecisions} source decisions</span>
                  <span>{s._count.tasks} tasks</span>
                  <span>{s._count.orders} orders</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline", IN_REVIEW: "default", APPROVED: "secondary", SUPERSEDED: "destructive",
  };
  return <Badge variant={variants[status] ?? "outline"}>{status.replace("_", " ")}</Badge>;
}
