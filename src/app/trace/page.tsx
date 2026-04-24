"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";

type TraceNode = { type: string; id: string; label: string; date?: string; href: string };
type TraceResult = { root: TraceNode; chain: TraceNode[] };

const TYPE_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  task:       { label: "Task",        cls: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",   dot: "bg-indigo-400" },
  order:      { label: "Order",       cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",      dot: "bg-amber-400" },
  spec:       { label: "Spec",        cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",   dot: "bg-violet-400" },
  decision:   { label: "Decision",    cls: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",   dot: "bg-yellow-400" },
  meeting:    { label: "Meeting",     cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",dot: "bg-emerald-400" },
  actionItem: { label: "Action Item", cls: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",      dot: "bg-slate-400" },
};

export default function TracePage() {
  const [entity, setEntity] = useState<"task" | "order" | "spec">("task");
  const [id, setId] = useState("");
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function trace() {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch(`/api/trace?entity=${entity}&id=${id.trim()}`);
    if (res.ok) {
      setResult(await res.json());
    } else {
      setError("Entity not found. Check the ID and try again.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Traceability Engine</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Answer "Why was this decision made?" by walking the execution graph</p>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-card px-5 py-5 max-w-2xl space-y-4">
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity Type</Label>
            <Select value={entity} onValueChange={(v) => setEntity(v as "task" | "order" | "spec")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="spec">Spec</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity ID</Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Paste the entity ID…"
              onKeyDown={(e) => e.key === "Enter" && trace()}
            />
          </div>
          <Button onClick={trace} disabled={loading || !id.trim()}>
            {loading ? "Tracing…" : "Trace"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Find IDs in the URL of any task, order, or spec detail page:{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/tasks/[id]</code>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive max-w-2xl">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5 max-w-4xl">
          <h2 className="font-semibold text-base">Trace Result</h2>

          <div className="flex items-center gap-2 flex-wrap">
            <TraceNodeChip node={result.root} />
            {result.chain.map((node) => (
              <span key={`${node.type}-${node.id}`} className="flex items-center gap-2">
                <ArrowLeft className="size-4 text-muted-foreground" />
                <TraceNodeChip node={node} />
              </span>
            ))}
          </div>

          {result.chain.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No upstream links found. This entity has no traceability connections yet.
            </p>
          )}

          <div className="rounded-xl border bg-muted/30 px-4 py-4 text-sm max-w-2xl">
            <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Reading the chain</p>
            <p className="text-xs text-muted-foreground">
              The root entity (leftmost) was created because of each step to its right. Click any node to see full context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TraceNodeChip({ node }: { node: TraceNode }) {
  const config = TYPE_CONFIG[node.type] ?? { label: node.type, cls: "bg-muted text-foreground ring-1 ring-border", dot: "bg-muted-foreground" };
  return (
    <Link href={node.href}>
      <div className={`rounded-xl px-3.5 py-2.5 hover:opacity-80 transition-opacity cursor-pointer group ${config.cls}`}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`size-1.5 rounded-full ${config.dot}`} />
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{config.label}</p>
          <ExternalLink className="size-3 opacity-0 group-hover:opacity-50 transition-opacity ml-auto" />
        </div>
        <p className="text-sm font-semibold leading-snug max-w-48 truncate">{node.label}</p>
        {node.date && (
          <p className="text-xs opacity-60 mt-0.5">
            {new Date(node.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>
    </Link>
  );
}
