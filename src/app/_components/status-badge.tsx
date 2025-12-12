import { Check, X, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import type { ConfirmationStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ConfirmationStatus;
  showIcon?: boolean;
  size?: "sm" | "default";
}

const statusConfig = {
  confirmed: {
    label: "Confirmado",
    variant: "confirmed" as const,
    icon: Check,
  },
  declined: {
    label: "Recusado",
    variant: "declined" as const,
    icon: X,
  },
  pending: {
    label: "Pendente",
    variant: "pending" as const,
    icon: Clock,
  },
};

export function StatusBadge({
  status,
  showIcon = true,
  size = "default",
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={size === "sm" ? "px-2 py-0 text-[10px]" : ""}
    >
      {showIcon && (
        <Icon className={size === "sm" ? "mr-1 h-3 w-3" : "mr-1 h-3.5 w-3.5"} />
      )}
      {config.label}
    </Badge>
  );
}
