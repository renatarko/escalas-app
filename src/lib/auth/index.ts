import { z } from "zod";
import {
  AbilityBuilder,
  createMongoAbility,
  type CreateAbility,
  type MongoAbility,
} from "@casl/ability";
import { permissions } from "./permissions";
import { bandSubject } from "./subjects/band";
import { scheduleSubject } from "./subjects/schedule";
import { type User } from "./models/user";

const appAbilitiesSchema = z.union([
  bandSubject,
  scheduleSubject,
  z.tuple([z.literal("manage"), z.literal("all")]),
]);

export type AppAbilities = z.infer<typeof appAbilitiesSchema>;

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility);

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Permission for role ${user.role} not found`);
  }

  permissions[user.role](user, builder);

  const ability = builder.build({
    detectSubjectType(item) {
      return item.__typename;
    },
  });

  return ability;
}
