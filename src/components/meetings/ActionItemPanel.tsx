"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Member = { id: string; name: string };
type ActionItem = { id: string; description: string; status: string; dueDate: Date | string | null; owner: Member | null };

export function ActionItemPanel({ meetingId, actionItems: initial, members }: { meetingId: string; actionItems: ActionItem[]; members: Member[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ description: "", ownerId: "", dueDate: "" });
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    const res = await fetch(`/api/meetings/${meetingId}/action-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ownerId: form.ownerId || undefined, dueDate: form.dueDate || undefined }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems([...items, item]);
      setForm({ description: "", ownerId: "", dueDate: "" });
      setAdding(false);
    }
    setLoading(false);
  }

  async function promoteToTask(item: ActionItem) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.description,
        sourceMeetingId: meetingId,
        sourceActionItemId: item.id,
        ownerId: item.owner?.id,
        dueDate: item.dueDate,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      router.push(`/tasks/${t.id}`);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/meetings/${meetingId}/action-items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionItemId: id, status }),
    });
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  const statusColor: Record<string, string> = {
    OPEN: "outline",
    IN_PROGRESS: "default",
    DONE: "secondary",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Action Items ({items.length})</h2>
        {!adding && <Button size="sm" variant="outline" onClick={() => setAdding(true)}>+ Add Action Item</Button>}
      </div>

      {items.length === 0 && !adding && <p className="text-muted-foreground text-sm">No action items yet.</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.description}</p>
              <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                {item.owner && <span>{item.owner.name}</span>}
                {item.dueDate && <span>Due {new Date(item.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v ?? "OPEN")}>
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {item.status !== "DONE" && (
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => promoteToTask(item)}>→ Task</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="rounded-lg border px-4 py-4 space-y-3 bg-muted/30">
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Input placeholder="e.g. Order NEMA 17 stepper motors" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select value={form.ownerId} onValueChange={(v) => setForm({ ...form, ownerId: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={loading || !form.description}>{loading ? "Saving..." : "Add Item"}</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
