import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { whatsappService, evolutionAPI } from "@/lib/whatsapp";
import { inngest } from "@/inngest/client";
import { EventsName } from "@/inngest/functions/eventsName";

export const whatsappRouter = createTRPCRouter({
  // Obter status da conexão
  getConnectionStatus: protectedProcedure.query(async () => {
    try {
      const state = await whatsappService.getConnectionState();
      return {
        connected: state.state === "open",
        state: state.state,
        instance: state.instance,
      };
    } catch (error) {
      return {
        connected: false,
        state: "error" as const,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }),

  // Obter QR Code para conexão
  getQRCode: protectedProcedure.query(async () => {
    try {
      const qrCode = await whatsappService.getQRCode();
      return {
        success: true,
        qrCode: qrCode.base64,
        code: qrCode.code,
        pairingCode: qrCode.pairingCode,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Erro ao obter QR Code",
      });
    }
  }),

  // Criar instância do WhatsApp
  createInstance: protectedProcedure
    .input(z.object({ instanceName: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const instance = await evolutionAPI.createInstance(input.instanceName);
        return {
          success: true,
          instance,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Erro ao criar instância",
        });
      }
    }),

  // Desconectar WhatsApp
  disconnect: protectedProcedure.mutation(async () => {
    try {
      await evolutionAPI.logout();
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Erro ao desconectar",
      });
    }
  }),

  // Reiniciar instância
  restartInstance: protectedProcedure.mutation(async () => {
    try {
      await evolutionAPI.restartInstance();
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Erro ao reiniciar",
      });
    }
  }),

  // Enviar mensagem de teste
  sendTestMessage: protectedProcedure
    .input(
      z.object({
        number: z.string().min(10, "Número inválido"),
        message: z.string().min(1, "Mensagem não pode estar vazia"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await whatsappService.sendMessage(
          input.number,
          input.message,
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error ?? "Erro ao enviar mensagem",
          });
        }

        return {
          success: true,
          messageId: result.messageId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Erro ao enviar mensagem",
        });
      }
    }),

  // Verificar se número tem WhatsApp
  checkNumber: protectedProcedure
    .input(z.object({ number: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await evolutionAPI.checkNumberExists(input.number);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Erro ao verificar número",
        });
      }
    }),

  // Enviar notificação de escala
  sendScheduleNotification: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
        // type: z
        //   .enum(["notification", "reminder", "cancellation", "update"])
        //   .default("notification"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const scheduleParticipantsId =
          await ctx.db.scheduleParticipant.findMany({
            where: {
              scheduleId: input.scheduleId,
            },
            select: {
              id: true,
            },
          });

        const result = await inngest.send({
          name: EventsName["batch-n8n"],
          data: {
            scheduleParticipants: scheduleParticipantsId.map(({ id }) => id),
          },
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erro ao agendar notificações",
        });
      }
    }),

  // Enviar notificação para participante específico
  sendParticipantNotification: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
        participantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { scheduleId, participantId } = input;

        const scheduleParticipantId =
          await ctx.db.scheduleParticipant.findFirst({
            where: {
              scheduleId,
              participantId,
            },
          });

        if (!scheduleParticipantId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Relação de Escala e Participante não encontrada.",
          });
        }

        const result = await inngest.send({
          name: EventsName["unique-n8n"],
          data: {
            scheduleParticipant: scheduleParticipantId?.id,
          },
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erro ao enviar notificação",
        });
      }
    }),
});
