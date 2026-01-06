"use client";

import { useNotificationLogs } from "@/hooks/use-notification-logs";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, MessageSquareWarning, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type NotificationLogsProps = Readonly<{
  scheduleId?: string;
}>;

export function NotificationLogs({ scheduleId }: NotificationLogsProps) {
  const { data, isLoading, isError } = useNotificationLogs(scheduleId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="text-primary h-4 w-4" />
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </div>
        {isLoading && (
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        )}
      </CardHeader>
      <CardContent>
        {isError && (
          <p className="text-destructive text-sm">
            Não foi possível carregar os logs de notificações.
          </p>
        )}

        {!isLoading && !data?.length && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MessageSquareWarning className="h-4 w-4" />
            Nenhum log disponível {scheduleId && "para esta escala"}.
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((log) => (
              <div
                key={log.id}
                className="border-border bg-muted/40 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    className="text-xs"
                    variant={
                      log.status === "success" ? "default" : "destructive"
                    }
                  >
                    {log.status === "success" ? "Sucesso" : "Erro"}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-foreground font-semibold capitalize">
                    {log.type}
                  </p>
                  <p className="text-primary text-sm">
                    {log.participant}{" "}
                    <b className="text-xs">({log.schedule})</b>
                  </p>
                  {log.message && (
                    <p className="text-muted-foreground text-xs wrap-break-word">
                      {log.message}
                    </p>
                  )}
                  {log.error && (
                    <p className="text-destructive text-xs wrap-break-word">
                      {log.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
