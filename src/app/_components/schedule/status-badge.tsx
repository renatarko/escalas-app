import { getScheduleStatus, type ScheduleParticipant } from "@/lib/types";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface ScheduleStatusBadgeProps {
  members: ScheduleParticipant[];
  className?: string;
}

export function ScheduleStatusBadge({
  members,
  className,
}: Readonly<ScheduleStatusBadgeProps>) {
  const { status, confirmed, pending } = getScheduleStatus(members);

  const config = {
    confirmed: {
      label: "Confirmados",
      variant: "success" as const,
      icon: CheckCircle2,
    },
    partial: {
      label: `${confirmed} sim · ${pending} aguardando`,
      variant: "warning" as const,
      icon: AlertCircle,
    },
    pending: {
      label: "Aguardando Respostas",
      variant: "pending" as const,
      icon: Clock,
    },
  };

  const currentConfig = config[status];
  const Icon = currentConfig.icon;

  return (
    <Badge variant={currentConfig.variant} className={cn("text-xs", className)}>
      <Icon className="h-3.5 w-3.5" />
      {currentConfig.label}
    </Badge>
  );
}
