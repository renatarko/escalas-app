import { z } from "zod";
import { scheduleSchema } from "../models/schedule";

export const scheduleSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("read"),
    z.literal("create"),
    z.literal("update"),
    z.literal("delete"),
  ]),
  z.union([z.literal("Schedule"), scheduleSchema]),
]);

export type ScheduleSubject = z.infer<typeof scheduleSubject>;
