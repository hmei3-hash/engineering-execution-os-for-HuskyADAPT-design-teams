"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Meeting = { id: string; title: string };
type Spec = { id: string; title: string };
type Task = { id: string; title: string };

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({ itemName: "", description: "", vendor: "", partNumber: "", quantity: "1", unitCostDollars: "", url: "", status: "REQUESTED", requestedBy: "", notes: "", sourceMeetingId: "", sourceSpecId: "", sourceTaskId: "" });

  useEffect(() => {
    Promise.all([fetch("/api/meetings").then((r) => r.json()), fetch("/api/specs").then((r) => r.json()), fetch("/api/tasks").then((r) => r.json())]).then(([m, s, t]) => { setMeetings(m); setSpecs(s); setTasks(t); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const unitCostCents = form.unitCostDollars ? Math.round(parseFloat(form.unitCostDollars) * 100) : undefined;
    const qty = parseInt(form.quantity) || 1;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: form.itemName, description: form.description || undefined, vendor: form.vendor || undefined, partNumber: form.partNumber || undefined,
        quantity: qty, unitCostCents, totalCostCents: unitCostCents ? unitCostCents * qty : undefined, url: form.url || undefined,
        status: form.status, requestedBy: form.requestedBy || undefined, notes: form.notes || undefined,
        sourceMeetingId: form.sourceMeetingId || undefined, sourceSpecId: form.sourceSpecId || undefined, sourceTaskId: form.sourceTaskId || undefined,
      }),
    });
    if (res.ok) { const o = await res.json(); router.push(`/orders/${o.id}`); } else { setLoading(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Order</h1>
        <p className="text-muted-foreground text-sm">Link to a spec or decision so every purchase is justified</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label>Item Name *</Label><Input required value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="e.g. NEMA 17 Stepper Motor" /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="e.g. Amazon, McMaster-Carr" /></div>
          <div className="space-y-1.5"><Label>Part Number</Label><Input value={form.partNumber} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Unit Cost ($)</Label><Input type="number" step="0.01" min="0" value={form.unitCostDollars} onChange={(e) => setForm({ ...form, unitCostDollars: e.target.value })} placeholder="0.00" /></div>
        </div>
        <div className="space-y-1.5"><Label>Purchase URL</Label><Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["REQUESTED","APPROVED","ORDERED","SHIPPED","RECEIVED","CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Requested by</Label><Input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} /></div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium">Design Justification (traceability)</p>
          <div className="space-y-1.5">
            <Label>Source Design Spec</Label>
            <Select value={form.sourceSpecId} onValueChange={(v) => setForm({ ...form, sourceSpecId: v ?? "" })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>{specs.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Source Meeting</Label>
            <Select value={form.sourceMeetingId} onValueChange={(v) => setForm({ ...form, sourceMeetingId: v ?? "" })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>{meetings.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Source Task</Label>
            <Select value={form.sourceTaskId} onValueChange={(v) => setForm({ ...form, sourceTaskId: v ?? "" })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>{tasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Order"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
