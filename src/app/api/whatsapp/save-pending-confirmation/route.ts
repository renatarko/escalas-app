// app/api/whatsapp/save-pending-confirmation/route.ts

import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  // Validar apiKey
  const authHeader = request.headers.get("x-api-key");
  console.log("authHeader", authHeader);
  console.log("API_KEY", apiKey);

  if (authHeader !== apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { whatsapp, scheduleId, participantId } = (await request.json()) as {
      scheduleId: string;
      participantId: string;
      whatsapp: string;
    };

    // Salvar em uma tabela temporária ou cache
    await db.pendingConfirmation.create({
      data: {
        whatsapp,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
        status: "awaiting_response",
        schedule: {
          connect: { id: scheduleId },
        },
        participant: {
          connect: { id: participantId },
        },
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
