import {
  Calendar,
  MapPin,
  Send,
  Users,
  ChevronRight,
  Loader2,
  MoreVertical,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  getConfirmationStatus,
  getScheduleStatus,
  type Schedule,
} from "@/lib/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar } from "../member/avatar";
import { Button } from "../ui/button";
import { StatusBadge } from "../status-badge";
import { ScheduleStatusBadge } from "./status-badge";
import { NotificationBtnParticipant } from "../notification-btn-participant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useMemo, useState } from "react";
import { isAdmin } from "@/lib/utils/role-checker";
import { getCurrentMembership } from "@/lib/hooks/members";

interface ScheduleCardProps {
  schedule: Schedule;
  onSendConfirmations?: (scheduleId: string) => void;
  onViewDetails?: (schedule: Schedule) => void;
  compact?: boolean;
  isSending?: boolean;
}

export function ScheduleCard({
  schedule,
  onSendConfirmations,
  onViewDetails,
  compact = false,
  isSending = false,
}: Readonly<ScheduleCardProps>) {
  const { membership } = getCurrentMembership();
  const { status, confirmed, pending } = getScheduleStatus(
    schedule.participants,
  );

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const isExpanded = expandedCard === schedule.id;
  const isPast = new Date(schedule.date) < new Date();

  const participants = useMemo(() => {
    if (expandedCard) {
      return schedule.participants;
    }
    return schedule.participants.slice(0, 3);
  }, [expandedCard, schedule.participants]);

  const isAdminRole = isAdmin(membership);

  return (
    <Card
      className={cn(
        "group hover:border-primary/30 relative overflow-hidden transition-all duration-300",
        isPast && "opacity-60",
        !compact && "hover:shadow-primary/5 hover:shadow-lg",
      )}
    >
      {/* Glow effect */}
      {isPast && (
        <div className="from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-foreground text-sm font-semibold">
              {schedule.title}
            </h3>
            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="text-primary h-4 w-4" />
                {format(new Date(schedule.date), "dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
              {/* <span className="flex items-center gap-1.5">
                <span className="text-muted-foreground/50">•</span>
                {format(new Date(schedule.date), "HH:mm")}
              </span> */}
              {schedule.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {schedule.location}
                </span>
              )}
            </div>
          </div>
          <ScheduleStatusBadge members={schedule.participants} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Members preview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {schedule.participants.slice(0, 4).map((member) => (
                <Avatar key={member.id} member={member.participant} size="sm" />
              ))}
              {schedule.participants.length > 4 && (
                <div className="bg-muted text-muted-foreground ring-card flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ring-2">
                  +{schedule.participants.length - 4}
                </div>
              )}
            </div>
            <span className="text-muted-foreground ml-2 text-sm">
              <Users className="mr-1 inline h-4 w-4" />
              {schedule.participants.length} integrantes
            </span>
          </div>
        </div>

        {/* Member status list */}
        {!compact && (
          <div
            className={`border-border/50 space-y-2 border-t pt-2 transition-all duration-150 ${expandedCard === schedule.id ? "max-h-full" : "max-h-64 overflow-hidden"}`}
          >
            {participants.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-1"
              >
                <Avatar
                  className="text-xs"
                  member={member.participant}
                  showName
                  size="sm"
                />

                <div className="flex items-center gap-4">
                  <StatusBadge
                    showIcon={false}
                    status={getConfirmationStatus(member.confirmed)}
                    size="sm"
                  />
                  {isAdminRole && !member.confirmed && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger>
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <NotificationBtnParticipant
                            scheduleId={schedule.id}
                            participantId={member.id}
                            hasWhatsapp
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
            {schedule.participants.length > 3 && !isExpanded && (
              <Button
                variant="link"
                className="hover:border-b-muted-foreground flex w-full"
                onClick={() => toggleCard(schedule.id)}
              >
                <span className="text-muted-foreground text-xs">
                  +{schedule.participants.length - 3} mais integrantes
                </span>
              </Button>
            )}

            {schedule.participants.length > 3 && isExpanded && (
              <Button
                variant="link"
                size="sm"
                className="hover:border-b-muted-foreground flex w-full"
                onClick={() => toggleCard(schedule.id)}
              >
                <span className="text-muted-foreground flex gap-1 text-xs">
                  <ChevronUp />
                  voltar
                </span>
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        {isAdminRole && (
          <div className="flex items-center gap-2 pt-2">
            {pending > 0 && !isPast && onSendConfirmations && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => onSendConfirmations(schedule.id)}
                    className="flex-1"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Notificar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSending
                    ? "Enviando..."
                    : "Enviar noficação de confirmação para todos integrantes"}
                </TooltipContent>
              </Tooltip>
            )}
            {!isPast && onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(schedule)}
                className={pending > 0 && !isPast ? "" : "flex-1"}
              >
                Ver Detalhes
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
