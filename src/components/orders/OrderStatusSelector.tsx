"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrderStatusSelector({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);

  async function update(v: string | null) {
    if (!v) return;
    setStatus(v);
    await fetch(`/api/orders/${orderId}`, {
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
        {["REQUESTED", "APPROVED", "ORDERED", "SHIPPED", "RECEIVED", "CANCELLED"].map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
