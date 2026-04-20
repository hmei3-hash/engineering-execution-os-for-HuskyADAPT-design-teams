"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Member = { id: string; name: string };
type Meeting = { id: string; title: string };
type Spec = { id: string; title: string };

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [form, setForm] = useState({ title: "", description: "", status: "TODO", priority: "MEDIUM", dueDate: "", ownerId: "", sourceMeetingId: "", sourceSpecId: "" });

  useEffect(() => {
    Promise.all([fetch("/api/members").then((r) => r.json()), fetch("/api/meetings").then((r) => r.json()), fetch("/api/specs").then((r) => r.json())]).then(([m, mt, s]) => { setMembers(m); setMeetings(mt); setSpecs(s); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ownerId: form.ownerId || undefined, sourceMeetingId: form.sourceMeetingId || undefined, sourceSpecId: form.sourceSpecId || undefined, dueDate: form.dueDate || undefined }),
    });
    if (res.ok) { const t = await res.json(); router.push(`/tasks/${t.id}`); } else { setLoading(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Task</h1>
        <p className="text-muted-foreground text-sm">Link to a meeting or spec for full traceability</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Prototype motor mount bracket" /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["BACKLOG","TODO","IN_PROGRESS","BLOCKED","DONE","CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v ?? "" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["LOW","MEDIUM","HIGH","CRITICAL"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={form.ownerId} onValueChange={(v) => setForm({ ...form, ownerId: v ?? "" })}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Source Meeting (traceability)</Label>
          <Select value={form.sourceMeetingId} onValueChange={(v) => setForm({ ...form, sourceMeetingId: v ?? "" })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>{meetings.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Source Design Spec (traceability)</Label>
          <Select value={form.sourceSpecId} onValueChange={(v) => setForm({ ...form, sourceSpecId: v ?? "" })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>{specs.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Task"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
