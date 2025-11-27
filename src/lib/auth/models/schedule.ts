import { z } from "zod";

export const scheduleSchema = z.object({
  __typename: z.literal("Schedule").default("Schedule"),
  id: z.string(),
  scheduleId: z.string(),
  createdById: z.string(),
});

export type Event = z.infer<typeof scheduleSchema>;
