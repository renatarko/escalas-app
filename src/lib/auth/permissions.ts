import { type AbilityBuilder } from "@casl/ability";
import { type AppAbility } from ".";
import { type User } from "./models/user";
import { type Role } from "./roles";

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

export const permissions: Record<Role, PermissionsByRole> = {
  OWNER(_, { can }) {
    can("manage", "all");
  },
  ADMIN(user, { can, cannot }) {
    can("manage", "all");
    can(["delete"], "Schedule", {
      createdById: { $eq: user.id },
    });
    can(["transfer_ownership", "update"], "Band", {
      createdById: { $eq: user.id },
    });
    cannot(["transfer_ownership", "update"], "Band");
  },
  MEMBER(user, { can }) {
    can("read", "Band");
    can("read", "Schedule");
    can(["update", "delete"], "Schedule", {
      createdById: { $eq: user.id },
    });
    can(["read", "create"], "Band");
    can(["update", "delete"], "Band", {
      createdById: { $eq: user.id },
    });
  },
};
