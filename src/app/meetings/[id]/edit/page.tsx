"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditMeetingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", location: "", agenda: "", notes: "", status: "SCHEDULED" });

  useEffect(() => {
    fetch(`/api/meetings/${id}`).then((r) => r.json()).then((m) => {
      setForm({
        title: m.title ?? "",
        date: m.date ? new Date(m.date).toISOString().slice(0, 16) : "",
        location: m.location ?? "",
        agenda: m.agenda ?? "",
        notes: m.notes ?? "",
        status: m.status ?? "SCHEDULED",
      });
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/meetings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push(`/meetings/${id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Meeting</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Date & Time *</Label>
          <Input type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status ?? "SCHEDULED"} onValueChange={(v) => setForm({ ...form, status: v ?? "SCHEDULED" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Agenda</Label>
          <Textarea rows={4} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Full meeting notes..." />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
