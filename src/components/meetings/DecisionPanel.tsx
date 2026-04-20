"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Decision = { id: string; summary: string; rationale: string | null; madeBy: string | null };

export function DecisionPanel({ meetingId, decisions: initial }: { meetingId: string; decisions: Decision[] }) {
  const [decisions, setDecisions] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ summary: "", rationale: "", madeBy: "" });
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    const res = await fetch(`/api/meetings/${meetingId}/decisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setDecisions([...decisions, d]);
      setForm({ summary: "", rationale: "", madeBy: "" });
      setAdding(false);
    }
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch(`/api/meetings/${meetingId}/decisions?decisionId=${id}`, { method: "DELETE" });
    setDecisions(decisions.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Decisions ({decisions.length})</h2>
        {!adding && <Button size="sm" variant="outline" onClick={() => setAdding(true)}>+ Add Decision</Button>}
      </div>

      {decisions.length === 0 && !adding && (
        <p className="text-muted-foreground text-sm">No decisions recorded yet.</p>
      )}

      <div className="space-y-2">
        {decisions.map((d) => (
          <div key={d.id} className="rounded-lg border px-4 py-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{d.summary}</p>
              <button onClick={() => remove(d.id)} className="text-muted-foreground hover:text-destructive text-xs shrink-0">remove</button>
            </div>
            {d.rationale && <p className="text-sm text-muted-foreground">{d.rationale}</p>}
            {d.madeBy && <p className="text-xs text-muted-foreground">— {d.madeBy}</p>}
          </div>
        ))}
      </div>

      {adding && (
        <div className="rounded-lg border px-4 py-4 space-y-3 bg-muted/30">
          <div className="space-y-1.5">
            <Label>Decision Summary *</Label>
            <Input placeholder="e.g. Chose stepper motors over servos" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Rationale</Label>
            <Textarea rows={2} placeholder="Why was this decision made?" value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Made by</Label>
            <Input placeholder="Team member name(s)" value={form.madeBy} onChange={(e) => setForm({ ...form, madeBy: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={loading || !form.summary}>{loading ? "Saving..." : "Save Decision"}</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
