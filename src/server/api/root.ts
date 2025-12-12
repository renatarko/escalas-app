import { userRouter } from "@/server/api/routers/user";
import { scheduleRouter } from "@/server/api/routers/schedule";
import { recurrenceRouter } from "@/server/api/routers/recurrence";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { bandRouter } from "./routers/band";
import { invitationRouter } from "./routers/invitation";
import { memberRouter } from "./routers/member";
import { whatsappRouter } from "./routers/whatsapp";
import { scheduleParticipantRouter } from "./routers/scheduleParticipant";
import { pendingConfirmationRouter } from "./routers/pendingConfirmation";
import { notificationLogRouter } from "./routers/notification-log";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  band: bandRouter,
  bandMember: memberRouter,
  schedule: scheduleRouter,
  scheduleParticipant: scheduleParticipantRouter,
  recurrence: recurrenceRouter,
  invitation: invitationRouter,
  whatsapp: whatsappRouter,
  pendingConfirmation: pendingConfirmationRouter,
  notificationLog: notificationLogRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
