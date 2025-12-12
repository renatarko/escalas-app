export type Instrument =
  | "guitar"
  | "electricGuitar"
  | "vocal"
  | "drum"
  | "keyboard"
  | "bass"
  | "percussion"
  | "saxophone"
  | "soundTechnician"
  | "media";

export interface Member {
  id: string;
  name: string;
  whatsapp: string;
  instrument?: string;
  avatar?: string;
  // createdAt: Date;
}

export interface ScheduleParticipant {
  id: string;
  scheduleId: string;
  participantId: string;
  participant: Member;
  confirmed: boolean | null;
  confirmationMessageId?: string;
  responseMessage?: string;
  respondedAt?: Date;
}

export interface Schedule {
  id: string;
  title: string;
  date: Date;
  location?: string;
  notes?: string;
  participants: ScheduleParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export type ConfirmationStatus = "confirmed" | "declined" | "pending";

export function getConfirmationStatus(
  confirmed: boolean | null,
): ConfirmationStatus {
  if (confirmed === true) return "confirmed";
  if (confirmed === false) return "declined";
  return "pending";
}

export function getScheduleStatus(members: ScheduleParticipant[]): {
  status: "confirmed" | "pending" | "partial";
  confirmed: number;
  declined: number;
  pending: number;
} {
  const confirmed = members.filter((m) => m.confirmed === true).length;
  const declined = members.filter((m) => m.confirmed === false).length;
  const pending = members.filter((m) => m.confirmed === null).length;

  let status: "confirmed" | "pending" | "partial" = "pending";
  if (pending === 0 && declined === 0) status = "confirmed";
  else if (confirmed > 0 || declined > 0) status = "partial";

  return { status, confirmed, declined, pending };
}
