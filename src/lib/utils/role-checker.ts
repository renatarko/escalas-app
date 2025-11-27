import { BandRole as Role } from "@prisma/client";

type Membership =
  | {
      id: string;
      role: Role;
      bandId: string;
      userId: string;
    }
  | undefined
  | null;

export const isOwner = (membership: Membership) => {
  return membership?.role === Role.OWNER;
};

export const isAdmin = (membership: Membership) => {
  return membership?.role === Role.ADMIN || membership?.role === Role.OWNER;
};

export const isMember = (membership: Membership) => {
  return membership?.role === Role.MEMBER;
};
