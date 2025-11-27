"use client";

import { createMongoAbility } from "@casl/ability";
import { createContext } from "react";
import { type MongoAbility } from "@casl/ability";
import { type BandRole as Role } from "@prisma/client";
import { defineAbilityFor } from "../auth";

export const AbilityContext = createContext<MongoAbility>(
  createMongoAbility([]),
);

type AbilityProviderType = Readonly<{
  user: {
    id: string;
    role: Role;
  };
  children: React.ReactNode;
}>;

export function AbilityProvider({ user, children }: AbilityProviderType) {
  const ability = defineAbilityFor({
    id: user.id,
    role: user.role,
    __typename: "User",
  });

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}
