import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid"; // For generating unique tokens
import { addDays } from "date-fns"; // For setting expiration dates
import { getData, sendEmail } from "@/lib/mailer";
import { CreateScaleForm } from "@/app/_components/create-scale-form";
import { InviteEmailTemplate } from "@/app/_components/emails/invite";

// Zod schemas for input validation
const createInvitationSchema = z.object({
  bandId: z.string().cuid(),
  email: z.string().email(),
  name: z.string().optional(),
  instruments: z
    .array(z.string())
    .min(1, "At least one instrument is required"),
});

const acceptInvitationSchema = z.object({
  token: z.string(),
});

const rejectInvitationSchema = z.object({
  token: z.string(),
});

const getInvitationsSchema = z.object({
  type: z.enum(["sent", "received"]).optional(),
  bandId: z.string().cuid().optional(),
});

export const invitationRouter = createTRPCRouter({
  // Create a new band invitation
  create: protectedProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { bandId, email, name, instruments } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx; // Authenticated user's ID

      // Check if the user has permission to invite (e.g., is the band creator or admin)
      const band = await ctx.db.band.findUnique({
        where: { id: bandId },
        include: {
          members: {
            where: { userId, isActive: true },
            select: { role: true },
          },
        },
      });

      if (!band) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Band not found",
        });
      }

      const isCreator = band.createdById === userId;
      const isAdmin = band.members.some(
        (member) => member.role === "ADMIN" || member.role === "OWNER",
      );

      if (!isCreator && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to invite members to this band",
        });
      }

      // Check if the email is already invited or a member
      const existingInvitation = await ctx.db.bandInvitation.findFirst({
        where: { bandId, email, status: "PENDING" },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An invitation for this email is already pending",
        });
      }

      const existingMember = await ctx.db.bandMember.findFirst({
        where: { bandId, user: { email }, isActive: true },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This user is already a member of the band",
        });
      }

      // Generate a unique token and expiration date
      const token = uuidv4();
      const expiresAt = addDays(new Date(), 7); // Invitation expires in 7 days

      // Create the invitation
      const invitation = await ctx.db.bandInvitation.create({
        data: {
          bandId,
          email,
          name,
          instruments,
          status: "PENDING",
          token,
          expiresAt,
          invitedById: userId,
        },
      });

      const htmlData = await getData(
        InviteEmailTemplate({ email, bandName: band.name, inviteId: token }),
      );
      const response = await sendEmail(
        email,
        "Escalas App - Convite para participar",
        htmlData,
      );

      console.log("enviado por email?", response);
      // TODO: Send an email with the invitation link (e.g., using a service like Nodemailer or Resend)
      // Example: sendInvitationEmail({ email, token, bandName: band.name });

      return invitation;
    }),

  // Accept an invitation
  accept: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx; // Authenticated user's ID

      // Find the invitation
      const invitation = await ctx.db.bandInvitation.findUnique({
        where: { token },
        include: { band: true },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation is not pending",
        });
      }

      if (invitation.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Verify the user accepting the invitation matches the email
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.email !== invitation.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to accept this invitation",
        });
      }

      // Create a BandMember record
      const bandMember = await ctx.db.bandMember.create({
        data: {
          bandId: invitation.bandId,
          userId,
          role: "MEMBER", // Default role
          instruments: invitation.instruments,
          isActive: true,
          joinedAt: new Date(),
        },
      });

      // Update the invitation
      await ctx.db.bandInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          userId,
        },
      });

      return { bandMember, band: invitation.band };
    }),

  // Reject an invitation
  reject: protectedProcedure
    .input(rejectInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      const {
        session: {
          user: { id: userId },
        },
      } = ctx; // Authenticated user's ID

      // Find the invitation
      const invitation = await ctx.db.bandInvitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation is not pending",
        });
      }

      // Verify the user rejecting the invitation matches the email
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.email !== invitation.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to reject this invitation",
        });
      }

      // Update the invitation status
      const updatedInvitation = await ctx.db.bandInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "DECLINED",
        },
      });

      return updatedInvitation;
    }),

  // Get invitations (sent or received)
  getInvitations: protectedProcedure
    .input(getInvitationsSchema)
    .query(async ({ ctx, input }) => {
      const {
        session: {
          user: { id: userId },
        },
      } = ctx; // Authenticated user's ID
      const { type, bandId } = input;

      const where: any = {};

      if (type === "sent") {
        where.invitedById = userId;
      } else if (type === "received") {
        where.email = (
          await ctx.db.user.findUnique({ where: { id: userId } })
        )?.email;
      } else {
        // Include both sent and received invitations
        where.OR = [
          { invitedById: userId },
          {
            email: (await ctx.db.user.findUnique({ where: { id: userId } }))
              ?.email,
          },
        ];
      }

      if (bandId) {
        where.bandId = bandId;
      }

      return ctx.db.bandInvitation.findMany({
        where,
        include: {
          band: true,
          invitedBy: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get invitation by token (public, no auth required)
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const { token } = input;

      const invitation = await ctx.db.bandInvitation.findUnique({
        where: { token },
        include: {
          band: true,
          invitedBy: true,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      return invitation;
    }),
});
