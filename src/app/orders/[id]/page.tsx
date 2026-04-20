import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelector } from "@/components/orders/OrderStatusSelector";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { sourceMeeting: true, sourceDecision: { include: { meeting: true } }, sourceSpec: true, sourceTask: true },
  });
  if (!order) notFound();

  const totalCents = order.totalCostCents ?? (order.quantity * (order.unitCostCents ?? 0));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/orders" className="text-muted-foreground text-sm hover:underline">Orders</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm">{order.itemName}</span>
          </div>
          <h1 className="text-2xl font-bold">{order.itemName}</h1>
        </div>
        <OrderStatusSelector orderId={id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><p className="text-muted-foreground text-xs uppercase mb-1">Vendor</p><p>{order.vendor ?? "—"}</p></div>
        <div><p className="text-muted-foreground text-xs uppercase mb-1">Quantity</p><p>{order.quantity}</p></div>
        <div><p className="text-muted-foreground text-xs uppercase mb-1">Total Cost</p><p>{totalCents > 0 ? `$${(totalCents / 100).toFixed(2)}` : "—"}</p></div>
        {order.partNumber && <div><p className="text-muted-foreground text-xs uppercase mb-1">Part #</p><p>{order.partNumber}</p></div>}
        {order.requestedBy && <div><p className="text-muted-foreground text-xs uppercase mb-1">Requested by</p><p>{order.requestedBy}</p></div>}
        {order.url && <div><p className="text-muted-foreground text-xs uppercase mb-1">Link</p><a href={order.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">Purchase link</a></div>}
      </div>

      {order.description && <p className="text-sm text-muted-foreground">{order.description}</p>}
      {order.notes && <div><p className="text-muted-foreground text-xs uppercase mb-1">Notes</p><p className="text-sm">{order.notes}</p></div>}

      <Separator />

      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Design Justification (Traceability)</h2>
        {!order.sourceSpec && !order.sourceDecision && !order.sourceMeeting && !order.sourceTask ? (
          <p className="text-muted-foreground text-sm">No justification links. <Link href={`/trace?entity=order&id=${id}`} className="underline">Run trace.</Link></p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-medium">{order.itemName}</span>
            {order.sourceTask && (
              <><span className="text-muted-foreground">←</span><Link href={`/tasks/${order.sourceTask.id}`}><span className="px-2 py-0.5 bg-muted rounded text-xs hover:underline">Task: {order.sourceTask.title}</span></Link></>
            )}
            {order.sourceSpec && (
              <><span className="text-muted-foreground">←</span><Link href={`/specs/${order.sourceSpec.id}`}><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:underline">Spec: {order.sourceSpec.title}</span></Link></>
            )}
            {order.sourceDecision && (
              <><span className="text-muted-foreground">←</span><span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">Decision: {order.sourceDecision.summary}</span></>
            )}
            {(order.sourceMeeting || order.sourceDecision?.meeting) && (
              <><span className="text-muted-foreground">←</span>
              <Link href={`/meetings/${(order.sourceMeeting ?? order.sourceDecision?.meeting)!.id}`}>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs hover:underline">Meeting: {(order.sourceMeeting ?? order.sourceDecision?.meeting)!.title}</span>
              </Link></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
