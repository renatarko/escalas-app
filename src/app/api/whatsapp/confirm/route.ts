import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";

// Chave de API simples para proteger o endpoint
const API_KEY = env.EVOLUTION_API_KEY;

export async function POST(request: Request) {
  try {
    // Verificar API key
    const authHeader = request.headers.get("x-api-key");
    if (authHeader !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      whatsapp: string;
      confirmed: boolean;
      justification?: string;
    };

    const { whatsapp, confirmed, justification } = body;

    if (!whatsapp || confirmed === undefined) {
      return NextResponse.json(
        { error: "whatsapp e confirmed são obrigatórios" },
        { status: 400 },
      );
    }

    // Formatar número (remover caracteres não numéricos)
    const cleanNumber = whatsapp.replaceAll(/\D/g, "");

    // Buscar usuário pelo WhatsApp
    const user = await db.user.findFirst({
      where: {
        whatsapp: {
          contains: cleanNumber.slice(-11), // Últimos 11 dígitos
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Buscar escalas pendentes do usuário (futuras)
    const pendingSchedules = await db.scheduleParticipant.findMany({
      where: {
        participantId: user.id,
        confirmed: null,
        schedule: {
          date: { gte: new Date() },
          status: "PENDING",
        },
      },
      orderBy: { schedule: { date: "asc" } },
      take: 1, // Pega a próxima escala pendente
    });

    if (pendingSchedules.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma escala pendente encontrada" },
        { status: 404 },
      );
    }

    // Atualizar confirmação
    const updated = await db.scheduleParticipant.update({
      where: { id: pendingSchedules[0]!.id },
      data: {
        confirmed,
        confirmedAt: new Date(),
        justification: justification ?? null,
      },
      include: {
        schedule: { select: { name: true, date: true } },
        participant: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Confirmação ${confirmed ? "aceita" : "recusada"} para ${updated.participant.name}`,
      schedule: updated.schedule.name,
      date: updated.schedule.date,
    });
  } catch (error) {
    console.error("Erro ao processar confirmação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
