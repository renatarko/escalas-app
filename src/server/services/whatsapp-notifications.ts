import { db } from "@/server/db";
import { SetInstrument } from "@/lib/utils/setInstrument";
import type { Instrument } from "@/lib/types";
import type {
  ScheduleParticipantNotificationPayload,
  WhatsAppNotificationResult,
} from "@/lib/whatsapp";
import { env } from "@/env";
import {
  generateScheduleNotificationMessage,
  generateScheduleReminderMessage,
} from "@/lib/whatsapp/service";

async function logNotificationResults({
  scheduleId,
  type,
  results,
  participantMap,
}: {
  scheduleId: string;
  type: NotificationType;
  results: WhatsAppNotificationResult[];
  participantMap: Map<
    string,
    { scheduleParticipantId?: string; participantId?: string }
  >;
}) {
  if (!results.length) return;

  try {
    await db.notificationLog.createMany({
      data: results.map((result) => {
        const match = participantMap.get(result.userId);
        return {
          scheduleId,
          scheduleParticipantId: match?.scheduleParticipantId,
          participantId: match?.participantId,
          status: result.success ? "success" : "error",
          type,
          message: result.messageId,
          error: result.error,
        };
      }),
    });
  } catch (error) {
    console.error("Erro ao registrar logs de notificação", error);
  }
}

type NotificationType = "notification" | "reminder" | "cancellation" | "update";

type ProcessScheduleNotificationsParams = {
  scheduleId: string;
  type?: NotificationType;
  changes?: string;
};

export type ProcessScheduleNotificationsResult = {
  success: boolean;
  message: string;
  sent: number;
  failed: number;
  details: WhatsAppNotificationResult[];
};

export async function processScheduleNotifications({
  scheduleId,
  type = "notification",
  changes,
}: ProcessScheduleNotificationsParams): Promise<ProcessScheduleNotificationsResult> {
  const schedule = await db.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      band: { select: { name: true } },
      participants: {
        include: {
          participant: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
            },
          },
        },
      },
    },
  });

  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  const participantsWithWhatsapp = schedule.participants
    .filter((p) => p.participant.whatsapp)
    .map((p) => ({
      scheduleParticipantId: p.id,
      participantId: p.participant.id,
      name: p.participant.name ?? "Participante",
      whatsapp: p.participant.whatsapp!,
      instrumentLabel:
        SetInstrument(p.instrument as Instrument).label ?? p.instrument,
      confirmed: p.confirmed,
    }));

  if (participantsWithWhatsapp.length === 0) {
    return {
      success: true,
      message: "Nenhum participante com WhatsApp cadastrado",
      sent: 0,
      failed: 0,
      details: [],
    };
  }

  const results: WhatsAppNotificationResult[] = [];

  const participantMap = new Map(
    participantsWithWhatsapp.map((participant) => [
      participant.participantId,
      {
        scheduleParticipantId: participant.scheduleParticipantId,
        participantId: participant.participantId,
      },
    ]),
  );

  const successfulUserIds = results
    .filter((result) => result.success && result.userId)
    .map((result) => result.userId);

  if (successfulUserIds.length > 0) {
    await db.scheduleParticipant.updateMany({
      where: {
        scheduleId: schedule.id,
        participantId: { in: successfulUserIds },
      },
      data: {
        notificationSent: true,
        notificationSentAt: new Date(),
      },
    });
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  await logNotificationResults({
    scheduleId: schedule.id,
    type,
    results,
    participantMap,
  });

  return {
    success: true,
    message: `Notificações enviadas: ${successCount} sucesso, ${failCount} falhas`,
    sent: successCount,
    failed: failCount,
    details: results,
  };
}

type ProcessScheduleAndParticipantNotificationsParams = {
  scheduleParticipantId: string;
  type?: "notification" | "reminder" | "cancellation" | "update";
};

export async function processScheduleAndParticipantNotifications({
  scheduleParticipantId,
  type,
}: ProcessScheduleAndParticipantNotificationsParams): Promise<ScheduleParticipantNotificationPayload> {
  const scheduleByParticipant = await db.scheduleParticipant.findUnique({
    where: { id: scheduleParticipantId }, // alterar para buscar do participant_id e schedule_id , TODO no front, passar os parametros corretos
    select: {
      id: true,
      participant: {
        select: {
          id: true,
          name: true,
          whatsapp: true,
        },
      },
      confirmed: true,
      instrument: true,
      justification: true,
      schedule: {
        select: {
          id: true,
          name: true,
          date: true,
        },
      },
    },
  });

  if (!scheduleByParticipant) {
    throw new Error(`ScheduleParticipant not found: ${scheduleByParticipant}`);
  }

  const { schedule, participant, instrument } = scheduleByParticipant;
  const messagePayload = {
    participantName: participant.name ?? "",
    scheduleName: schedule.name ?? "",
    date: schedule.date,
    instrument,
    scheduleParticipantId: scheduleByParticipant.id,
    pendingConfirmationId: "",
  };

  let message = "";
  if (type === "notification") {
    message = generateScheduleNotificationMessage(messagePayload);
  } else {
    message = generateScheduleReminderMessage(messagePayload);
  }

  const payload: ScheduleParticipantNotificationPayload = {
    evolution: {
      instance: env.EVOLUTION_INSTANCE_NAME,
      serverUrl: env.EVOLUTION_API_URL,
      apikey: "DB678B3D5F36-47D6-BC95-C7FD516D0140",
    },
    app: {
      webhookUrl: env.NEXT_PUBLIC_API_URL,
      xApiKey: env.EVOLUTION_API_KEY,
    },
    schedule: {
      id: scheduleByParticipant.schedule.id,
      name: scheduleByParticipant.schedule.name ?? "",
      date: scheduleByParticipant.schedule.date,
    },
    member: {
      id: scheduleByParticipant.participant.id,
      name: scheduleByParticipant.participant.name ?? "",
      whatsapp: scheduleByParticipant.participant.whatsapp ?? "",
      confirmed: scheduleByParticipant.confirmed,
      instrument:
        SetInstrument(scheduleByParticipant.instrument as Instrument).label ??
        "",
    },
    message,
  };

  return payload;
}
