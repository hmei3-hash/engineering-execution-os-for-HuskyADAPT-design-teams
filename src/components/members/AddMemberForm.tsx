"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddMemberForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", email: "", role: "" });
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to add member");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-3 max-w-2xl">
      <div className="flex-1 space-y-1.5">
        <Label>Name *</Label>
        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Chen" />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label>Email *</Label>
        <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@uw.edu" />
      </div>
      <div className="flex-1 space-y-1.5">
        <Label>Role *</Label>
        <Input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Mechanical Lead" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add"}</Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </form>
  );
}
