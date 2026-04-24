import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, GitMerge, CheckSquare, Package, ChevronRight } from "lucide-react";

const STATUS_MAP: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; dot: string }> = {
  DRAFT:      { variant: "outline",     label: "Draft",      dot: "bg-slate-400" },
  IN_REVIEW:  { variant: "default",     label: "In Review",  dot: "bg-indigo-500" },
  APPROVED:   { variant: "secondary",   label: "Approved",   dot: "bg-emerald-500" },
  SUPERSEDED: { variant: "destructive", label: "Superseded", dot: "bg-red-400" },
};

export default async function SpecsPage() {
  const specs = await prisma.designSpec.findMany({
    include: { _count: { select: { sourceDecisions: true, tasks: true, orders: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Design Specs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {specs.length} spec{specs.length !== 1 ? "s" : ""} · engineering intent, constraints, and success metrics
          </p>
        </div>
        <Link href="/specs/new">
          <Button size="sm">
            <Plus className="size-3.5" />
            New Spec
          </Button>
        </Link>
      </div>

      {specs.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <FileText className="size-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No design specs yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create a spec to capture engineering intent and link to tasks.</p>
          <Link href="/specs/new">
            <Button className="mt-5" variant="outline" size="sm">Create First Spec</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {specs.map((s) => {
            const { variant, label, dot } = STATUS_MAP[s.status] ?? STATUS_MAP.DRAFT;
            return (
              <Link key={s.id} href={`/specs/${s.id}`}>
                <div className="rounded-xl border bg-card px-5 py-4 hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <FileText className="size-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{s.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.problemStatement}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">v{s.version}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${dot}`} />
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex gap-5 mt-3 ml-12 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <GitMerge className="size-3.5" />
                      {s._count.sourceDecisions} decisions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="size-3.5" />
                      {s._count.tasks} tasks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Package className="size-3.5" />
                      {s._count.orders} orders
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
