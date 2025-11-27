import { z } from "zod";

export const bandSchema = z.object({
  __typename: z.literal("Band").default("Band"),
  id: z.string(),
  createdById: z.string(),
});

export type Organization = z.infer<typeof bandSchema>;
