"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditSpecPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", version: "1.0", status: "DRAFT", problemStatement: "", constraints: "", successMetrics: "", proposedSolution: "", risks: "", notes: "" });

  useEffect(() => {
    fetch(`/api/specs/${id}`).then((r) => r.json()).then((s) => {
      setForm({ title: s.title ?? "", version: s.version ?? "1.0", status: s.status ?? "DRAFT", problemStatement: s.problemStatement ?? "", constraints: s.constraints ?? "", successMetrics: s.successMetrics ?? "", proposedSolution: s.proposedSolution ?? "", risks: s.risks ?? "", notes: s.notes ?? "" });
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/specs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    router.push(`/specs/${id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Design Spec</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="SUPERSEDED">Superseded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Problem Statement *</Label><Textarea rows={3} required value={form.problemStatement} onChange={(e) => setForm({ ...form, problemStatement: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Constraints *</Label><Textarea rows={3} required value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Success Metrics *</Label><Textarea rows={3} required value={form.successMetrics} onChange={(e) => setForm({ ...form, successMetrics: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Proposed Solution</Label><Textarea rows={3} value={form.proposedSolution} onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Risks</Label><Textarea rows={2} value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
