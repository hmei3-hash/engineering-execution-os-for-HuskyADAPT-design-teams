"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TraceNode = { type: string; id: string; label: string; date?: string; href: string };
type TraceResult = { root: TraceNode; chain: TraceNode[] };

const typeColors: Record<string, string> = {
  task: "bg-blue-50 text-blue-700 border-blue-200",
  order: "bg-orange-50 text-orange-700 border-orange-200",
  spec: "bg-purple-50 text-purple-700 border-purple-200",
  decision: "bg-yellow-50 text-yellow-700 border-yellow-200",
  meeting: "bg-green-50 text-green-700 border-green-200",
  actionItem: "bg-gray-50 text-gray-700 border-gray-200",
};

const typeLabels: Record<string, string> = { task: "Task", order: "Order", spec: "Spec", decision: "Decision", meeting: "Meeting", actionItem: "Action Item" };

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
      setError("Entity not found. Make sure the ID is correct.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Traceability Engine</h1>
        <p className="text-muted-foreground text-sm">Answer "Why was this decision made?" by walking the execution graph</p>
      </div>

      <div className="flex items-end gap-3 max-w-2xl">
        <div className="space-y-1.5">
          <Label>Entity Type</Label>
          <Select value={entity} onValueChange={(v) => setEntity(v as "task" | "order" | "spec")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="spec">Spec</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Entity ID</Label>
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Paste the entity ID here..." onKeyDown={(e) => e.key === "Enter" && trace()} />
        </div>
        <Button onClick={trace} disabled={loading || !id.trim()}>{loading ? "Tracing..." : "Trace"}</Button>
      </div>

      <div className="text-xs text-muted-foreground max-w-2xl">
        <p>Find entity IDs by visiting the detail page of any task, order, or spec. The ID is in the URL: <code className="bg-muted px-1 rounded">/tasks/[id]</code></p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="space-y-4">
          <h2 className="font-semibold">Trace Result</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <TraceNodeChip node={result.root} />
            {result.chain.map((node, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-muted-foreground text-lg">←</span>
                <TraceNodeChip node={node} />
              </span>
            ))}
          </div>

          {result.chain.length === 0 && (
            <p className="text-muted-foreground text-sm">No upstream links found. This entity has no traceability connections yet.</p>
          )}

          <div className="rounded-lg border p-4 bg-muted/30 max-w-2xl">
            <p className="text-sm font-medium mb-2">Reading the chain</p>
            <p className="text-xs text-muted-foreground">
              The chain reads right-to-left: the root entity (leftmost) was created because of each step to its right.
              Navigate to any node to see full context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TraceNodeChip({ node }: { node: TraceNode }) {
  return (
    <Link href={node.href}>
      <div className={`rounded-lg border px-3 py-2 hover:opacity-80 transition-opacity cursor-pointer ${typeColors[node.type] ?? "bg-muted"}`}>
        <p className="text-xs font-medium uppercase tracking-wide">{typeLabels[node.type] ?? node.type}</p>
        <p className="text-sm font-semibold leading-tight max-w-48 truncate">{node.label}</p>
        {node.date && <p className="text-xs opacity-70">{new Date(node.date).toLocaleDateString()}</p>}
      </div>
    </Link>
  );
}
