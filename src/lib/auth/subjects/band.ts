import { z } from "zod";
import { bandSchema } from "../models/band";

export const bandSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("read"),
    z.literal("create"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("transfer_ownership"),
  ]),
  z.union([z.literal("Band"), bandSchema]),
]);

export type OrganizationSubject = z.infer<typeof bandSubject>;
