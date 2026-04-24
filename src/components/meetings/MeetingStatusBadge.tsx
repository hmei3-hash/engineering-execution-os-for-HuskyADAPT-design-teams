import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  SCHEDULED:   { variant: "outline",     label: "Scheduled" },
  IN_PROGRESS: { variant: "default",     label: "In Progress" },
  COMPLETED:   { variant: "secondary",   label: "Completed" },
  CANCELLED:   { variant: "destructive", label: "Cancelled" },
};

export function MeetingStatusBadge({ status }: { status: string }) {
  const { variant, label } = STATUS_MAP[status] ?? { variant: "outline" as const, label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
