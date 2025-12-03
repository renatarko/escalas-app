import { db } from "@/server/db";
import { whatsappService } from "@/lib/whatsapp";
import { SetInstrument } from "@/lib/utils/setInstrument";
import type { Instrument } from "@/lib/types";
import type {
  ScheduleNotificationPayload,
  ScheduleParticipantNotificationPayload,
  WhatsAppNotificationResult,
} from "@/lib/whatsapp";

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

  const payload: ScheduleNotificationPayload = {
    scheduleId: schedule.id,
    bandName: schedule.band.name,
    scheduleName: schedule.name ?? "Escala",
    date: new Date(schedule.date).toISOString(),
    time: schedule.time ? new Date(schedule.time).toISOString() : undefined,
    participants: participantsWithWhatsapp.map((participant) => ({
      scheduleParticipantId: participant.scheduleParticipantId,
      userId: participant.participantId,
      name: participant.name,
      whatsapp: participant.whatsapp,
      instrument: participant.instrumentLabel,
    })),
  };

  let results: WhatsAppNotificationResult[] = [];

  if (type === "reminder") {
    results = await whatsappService.sendScheduleReminders(payload);
  } else {
    results = await whatsappService.sendScheduleNotifications(payload);
  }

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

  return {
    success: true,
    message: `Notificações enviadas: ${successCount} sucesso, ${failCount} falhas`,
    sent: successCount,
    failed: failCount,
    details: results,
  };
}

type ProcessScheduleAndParticipantNotificationsParams = {
  scheduleParticipant: string;
};

export async function processScheduleAndParticipantNotifications({
  scheduleParticipant,
}: ProcessScheduleAndParticipantNotificationsParams): Promise<ScheduleParticipantNotificationPayload> {
  const scheduleByParticipant = await db.scheduleParticipant.findUnique({
    where: { id: scheduleParticipant },
    select: {
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
    throw new Error(`Schedule not found: ${scheduleByParticipant}`);
  }

  const payload: ScheduleParticipantNotificationPayload = {
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
  };

  return payload;
}
