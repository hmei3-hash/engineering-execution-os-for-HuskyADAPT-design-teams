import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle } from "lucide-react";

const STATUS_MAP: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; dot: string }> = {
  REQUESTED: { variant: "outline",     label: "Requested", dot: "bg-slate-400" },
  APPROVED:  { variant: "default",     label: "Approved",  dot: "bg-indigo-500" },
  ORDERED:   { variant: "default",     label: "Ordered",   dot: "bg-blue-500" },
  SHIPPED:   { variant: "secondary",   label: "Shipped",   dot: "bg-amber-500" },
  RECEIVED:  { variant: "secondary",   label: "Received",  dot: "bg-emerald-500" },
  CANCELLED: { variant: "destructive", label: "Cancelled", dot: "bg-red-400" },
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { sourceMeeting: true, sourceDecision: true, sourceSpec: true, sourceTask: true },
    orderBy: { createdAt: "desc" },
  });

  const pendingOrders = orders.filter((o) => ["REQUESTED", "APPROVED", "ORDERED"].includes(o.status));
  const totalPending = pendingOrders.reduce((s, o) => s + (o.totalCostCents ?? o.quantity * (o.unitCostCents ?? 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Procurement linked to design justifications</p>
        </div>
        <Link href="/orders/new">
          <Button size="sm">
            <Plus className="size-3.5" />
            New Order
          </Button>
        </Link>
      </div>

      {totalPending > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span className="text-amber-800">
            <span className="font-semibold">Pending spend: </span>
            ${(totalPending / 100).toFixed(2)} across {pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <Package className="size-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create an order and link it to a spec or decision.</p>
          <Link href="/orders/new">
            <Button className="mt-5" variant="outline" size="sm">Create First Order</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cost</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => {
                const cost = o.totalCostCents ?? o.quantity * (o.unitCostCents ?? 0);
                const source = o.sourceSpec?.title ?? o.sourceDecision?.summary ?? o.sourceMeeting?.title ?? o.sourceTask?.title;
                const { variant, label, dot } = STATUS_MAP[o.status] ?? STATUS_MAP.REQUESTED;
                return (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/orders/${o.id}`} className="font-medium hover:text-primary transition-colors">
                        {o.itemName}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs hidden sm:table-cell">{o.vendor ?? "—"}</td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">{o.quantity}</td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {cost > 0 ? <span className="font-medium text-foreground">${(cost / 100).toFixed(2)}</span> : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${dot}`} />
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs truncate max-w-36 hidden lg:table-cell">
                      {source ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
