import { env } from "@/env";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "escalas-app",
  env: env.INNGEST_EVENT_KEY,
});
