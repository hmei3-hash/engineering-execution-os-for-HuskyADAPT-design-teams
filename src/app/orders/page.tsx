import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { sourceMeeting: true, sourceDecision: true, sourceSpec: true, sourceTask: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPending = orders.filter((o) => ["REQUESTED", "APPROVED", "ORDERED"].includes(o.status)).reduce((s, o) => s + (o.totalCostCents ?? (o.quantity * (o.unitCostCents ?? 0))), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm">Hardware/software procurement linked to design justifications</p>
        </div>
        <Link href="/orders/new"><Button>+ New Order</Button></Link>
      </div>

      {totalPending > 0 && (
        <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm">
          <span className="font-medium text-orange-800">Pending spend: </span>
          <span className="text-orange-700">${(totalPending / 100).toFixed(2)}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/orders/new"><Button className="mt-4" variant="outline">Create First Order</Button></Link>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Item</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Cost</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => {
                const cost = o.totalCostCents ?? (o.quantity * (o.unitCostCents ?? 0));
                const source = o.sourceSpec?.title ?? o.sourceDecision?.summary ?? o.sourceMeeting?.title ?? o.sourceTask?.title;
                return (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${o.id}`} className="font-medium hover:underline">{o.itemName}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.vendor ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.quantity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cost > 0 ? `$${(cost / 100).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-32">{source ?? "—"}</td>
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

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    REQUESTED: "outline", APPROVED: "default", ORDERED: "default", SHIPPED: "secondary", RECEIVED: "secondary", CANCELLED: "destructive",
  };
  return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
}
