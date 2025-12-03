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

    const pending = await db.pendingConfirmation.findFirst({
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
            scheduleParticipants: {
              select: {
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

    if (!pending) {
      return Response.json({ scheduleId: null });
    }

    const scheduleParticipant = pending.participant.scheduleParticipants.find(
      (scheduleParticipant) =>
        scheduleParticipant.scheduleId === pending.scheduleId,
    );

    return Response.json({
      scheduleId: pending.scheduleId,
      schedule: pending.schedule,
      member: {
        id: pending.participant.id,
        name: pending.participant.name,
        confirmed: scheduleParticipant?.confirmed ?? null,
        justification: scheduleParticipant?.justification ?? null,
        instrument: scheduleParticipant?.instrument ?? null,
      },
      pendingConfirmation: pending.id,
      pendingConfirmationStatus: pending.status,
    });
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
