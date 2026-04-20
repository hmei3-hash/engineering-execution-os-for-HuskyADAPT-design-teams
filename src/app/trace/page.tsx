"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { type SearchHit } from "@/app/api/search/route";

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

const typeLabels: Record<string, string> = {
  task: "Task",
  order: "Order",
  spec: "Spec",
  decision: "Decision",
  meeting: "Meeting",
  actionItem: "Action Item",
};

const typeIcons: Record<string, string> = {
  task: "✓",
  order: "🛒",
  spec: "📄",
  decision: "⚖️",
  meeting: "🗓",
};

export default function TracePage() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<SearchHit | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data: SearchHit[] = await res.json();
        setHits(data);
        setOpen(data.length > 0);
      }
    }, 250);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function runTrace(hit: SearchHit) {
    setSelected(hit);
    setQuery(hit.title);
    setOpen(false);
    setLoading(true);
    setError("");
    setResult(null);

    // Only task/order/spec are supported by the trace engine
    const traceableTypes = ["task", "order", "spec"];
    if (!traceableTypes.includes(hit.type)) {
      setError(`Traceability is not supported for type "${hit.type}". Select a task, order, or spec.`);
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/trace?entity=${hit.type}&id=${hit.id}`);
    if (res.ok) {
      setResult(await res.json());
    } else {
      setError("Could not trace this entity. It may have no upstream links.");
    }
    setLoading(false);
  }

  const grouped = hits.reduce<Record<string, SearchHit[]>>((acc, h) => {
    (acc[h.type] ??= []).push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Traceability Engine</h1>
        <p className="text-muted-foreground text-sm">Answer "Why was this decision made?" by walking the execution graph</p>
      </div>

      <div className="max-w-2xl" ref={containerRef}>
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); setResult(null); setError(""); }}
            placeholder="Search tasks, orders, specs… (e.g. esp32)"
            className="w-full"
            autoComplete="off"
          />

          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-96 overflow-y-auto">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/40 sticky top-0">
                    {typeIcons[type]} {typeLabels[type] ?? type}
                  </div>
                  {items.map((hit) => (
                    <button
                      key={hit.id}
                      className="w-full text-left px-3 py-2 hover:bg-accent flex items-start justify-between gap-3 group"
                      onMouseDown={() => runTrace(hit)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{hit.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{hit.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hit.badge && (
                          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${typeColors[hit.type] ?? "bg-muted"}`}>
                            {hit.badge}
                          </span>
                        )}
                        {hit.url && (
                          <a
                            href={hit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-600 underline hover:text-orange-800"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            Buy →
                          </a>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {!selected && query.length < 2 && (
          <p className="text-xs text-muted-foreground mt-2">
            Type at least 2 characters to search across all entity types. Click a result to trace its upstream chain.
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Tracing…</p>}
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
