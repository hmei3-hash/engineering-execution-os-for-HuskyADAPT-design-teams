"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaskStatusSelector({ taskId, currentStatus }: { taskId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);

  async function update(v: string | null) {
    if (!v) return;
    setStatus(v);
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: v }),
    });
  }

  return (
    <Select value={status} onValueChange={update}>
      <SelectTrigger className="h-8 w-36 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"].map((s) => (
          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
