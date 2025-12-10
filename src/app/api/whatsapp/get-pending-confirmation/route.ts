// app/api/whatsapp/get-pending-confirmation/route.ts

import { db } from "@/server/db";
import { NextResponse } from "next/server";

function normalizePhone(phone: string) {
  // remove não numéricos
  let w = phone.replace(/\D/g, "");

  // adiciona 55 se não tiver
  if (!w.startsWith("55")) {
    w = "55" + w;
  }

  // agora w está assim: 55 + ddd + número...
  const ddd = w.slice(2, 4);
  const base = w.slice(4);

  // se número tem 9 dígitos e começa com 9 → celular correto
  if (base.length === 9 && base.startsWith("9")) {
    return w;
  }

  // se tem 8 dígitos → adicionar 9 no começo
  if (base.length === 8) {
    return "55" + ddd + "9" + base;
  }

  // se já está no formato completo → retorna
  return w;
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const authHeader = request.headers.get("x-api-key");

  if (authHeader !== apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { whatsapp } = (await request.json()) as { whatsapp: string };

    const normalized = normalizePhone(whatsapp);

    console.log("--- WHATSAPP---", normalized);

    const pendingResults = await db.pendingConfirmation.findMany({
      where: {
        whatsapp: normalized,
        // status: "awaiting_response",
        expiresAt: { gt: new Date() },
      },
      include: {
        schedule: {
          select: {
            id: true,
            name: true,
            date: true,
            notes: true,
          },
        },
        participant: {
          select: {
            name: true,
            id: true,
            whatsapp: true,
            scheduleParticipants: {
              select: {
                participantId: true,
                scheduleId: true,
                confirmed: true,
                justification: true,
                instrument: true,
              },
            },
          },
        },
      },
    });

    if (!pendingResults) {
      return Response.json({ scheduleId: null });
    }

    const result = pendingResults.map((p) => {
      const scheduleParticipant = p.participant.scheduleParticipants.find(
        (sp) => sp.scheduleId === p.schedule.id,
      );

      return {
        ...p,
        participant: {
          ...p.participant,
          instrument: scheduleParticipant?.instrument,
          confirmed: scheduleParticipant?.confirmed,
          justification: scheduleParticipant?.justification,
        },
      };
    });

    // Get the most recent pending confirmation
    const pendingConfirmation = result[0];
    if (!pendingConfirmation) {
      return Response.json({ scheduleId: null });

      // return NextResponse.json(
      //   { error: "Não encontramos um Chamado de notificação anterior." },
      //   { status: 500 },
      // );
    }

    const {
      participantId,
      scheduleId,
      schedule,
      id,
      status,
      participant: {
        confirmed,
        justification,
        instrument,
        name: participantName,
      },
    } = pendingConfirmation;
    // const scheduleParticipant = pending.participant.scheduleParticipants.find(
    //   (scheduleParticipant) =>
    //     scheduleParticipant.scheduleId === pending.scheduleId,
    // );

    return Response.json({
      scheduleId,
      schedule: schedule,
      member: {
        id: participantId,
        name: participantName,
        confirmed,
        justification,
        instrument,
      },
      pendingConfirmation: id,
      pendingConfirmationStatus: status,
    });
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
