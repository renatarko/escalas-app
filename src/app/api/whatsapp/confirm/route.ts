import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";

// Chave de API simples para proteger o endpoint
const API_KEY = env.EVOLUTION_API_KEY;

/**
 * Endpoint para n8n processar confirmações de escalas via WhatsApp
 *
 * O n8n deve chamar este endpoint quando receber uma resposta do participante.
 *
 * Body esperado:
 * {
 *   scheduleParticipantId: string, // ID do ScheduleParticipant (obrigatório)
 *   messageText: string,           // Texto da resposta do participante
 *   phoneNumber?: string,          // Número do WhatsApp (opcional, para validação)
 * }
 */
export async function POST(request: Request) {
  try {
    // Verificar API key
    const authHeader = request.headers.get("x-api-key");
    console.log("authHeader", authHeader);
    console.log("API_KEY", API_KEY);

    if (authHeader !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      scheduleId: string;
      participantId: string;
      isConfirmed: boolean;
      justification?: string;
      phoneNumber?: string;
      pendingConfirmation: string;
    };

    const {
      scheduleId,
      participantId,
      isConfirmed,
      justification,
      pendingConfirmation,
    } = body;

    if (!participantId || !scheduleId) {
      return NextResponse.json(
        { error: "scheduleId, participantId e isConfirmed são obrigatórios" },
        { status: 400 },
      );
    }

    // Buscar o ScheduleParticipant pelo ID
    const scheduleParticipant = await db.scheduleParticipant.findFirst({
      where: { participantId, scheduleId },
      include: {
        participant: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
          },
        },
        schedule: {
          select: {
            id: true,
            name: true,
            date: true,
            status: true,
          },
        },
      },
    });

    if (!scheduleParticipant) {
      console.log("ScheduleParticipant não encontrado");
      return NextResponse.json(
        { error: "ScheduleParticipant não encontrado" },
        { status: 404 },
      );
    }

    // Validação opcional: verificar se o número corresponde ao participante
    // if (phoneNumber) {
    //   const cleanNumber = phoneNumber.replaceAll(/\D/g, "");
    //   const participantWhatsapp =
    //     scheduleParticipant.participant.whatsapp?.replaceAll(/\D/g, "");

    //   if (
    //     participantWhatsapp &&
    //     !participantWhatsapp.includes(cleanNumber.slice(-11)) &&
    //     !cleanNumber.includes(participantWhatsapp.slice(-11))
    //   ) {
    //     console.log(
    //       "Número de WhatsApp não corresponde ao participante da escala",
    //     );
    //     return NextResponse.json(
    //       {
    //         error:
    //           "Número de WhatsApp não corresponde ao participante da escala",
    //       },
    //       { status: 400 },
    //     );
    //   }
    // }

    if (new Date(scheduleParticipant.schedule.date) < new Date()) {
      console.log("Escala já passou");
      return NextResponse.json(
        { message: "Não foi possível atualizar o status. A escala já passou" },
        { status: 200 },
      );
    }

    const response = await db.$transaction(async (cx) => {
      const updated = await cx.scheduleParticipant.update({
        where: { id: scheduleParticipant.id },
        data: {
          confirmed: isConfirmed,
          confirmedAt: new Date(),
          justification: isConfirmed ? null : justification,
        },
        include: {
          schedule: { select: { name: true, date: true } },
          participant: { select: { name: true } },
        },
      });

      await cx.pendingConfirmation.update({
        where: { id: pendingConfirmation },
        data: {
          status: "completed",
        },
      });

      return {
        updated,
      };
    });

    console.log("Confirmação atualizada", response.updated);

    return NextResponse.json({
      success: true,
      message: `Confirmação ${isConfirmed ? "aceita" : "recusada"} para ${response.updated.participant.name}`,
      scheduleParticipantId: response.updated.id,
      schedule: {
        id: scheduleParticipant.schedule.id,
        name: response.updated.schedule.name,
        date: response.updated.schedule.date,
      },
      confirmed: isConfirmed,
    });
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
