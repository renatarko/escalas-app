import type { InvitationStatus } from "@prisma/client";

export const daysOfWeekOptions = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];

export const weeksOfMonthOptions = [
  { value: "1", label: "1ª semana" },
  { value: "2", label: "2ª semana" },
  { value: "3", label: "3ª semana" },
  { value: "4", label: "4ª semana" },
  { value: "5", label: "Última semana" },
];

export const instrumentsIcons = {
  guitar: "🪕",
  electricGuitar: "🎸",
  vocal: "🎤",
  drum: "🥁",
  keyboard: "🎹",
  bass: "🎸",
  percussion: "🪘",
  saxophone: "🎷",
  soundTechnician: "🎛️",
  media: "🖥️",
};

export const instrumentOptions = [
  { value: "guitar", label: "Violão", icon: instrumentsIcons.guitar },
  {
    value: "electricGuitar",
    label: "Guitarra",
    icon: instrumentsIcons.electricGuitar,
  },
  { value: "bass", label: "Contrabaixo", icon: instrumentsIcons.bass },
  { value: "vocal", label: "Vocal", icon: instrumentsIcons.vocal },
  { value: "drum", label: "Bateria", icon: instrumentsIcons.drum },
  { value: "keyboard", label: "Teclado", icon: instrumentsIcons.keyboard },
  {
    value: "percussion",
    label: "Percussão",
    icon: instrumentsIcons.percussion,
  },
  {
    value: "saxophone",
    label: "Saxofone",
    icon: instrumentsIcons.saxophone,
  },
  {
    value: "soundTechnician",
    label: "Técnico de som",
    icon: instrumentsIcons.soundTechnician,
  },
  {
    value: "media",
    label: "Mídia",
    icon: instrumentsIcons.media,
  },
];

export const memberRoleLabel = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MEMBER: "Integrante",
};

export const invitationStatusLabel: Record<InvitationStatus, string> = {
  PENDING: "Pendente",
  DECLINED: "Rejeitado",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
  ACCEPTED: "Aceito",
};

export const WHATSAPP_BASE_URL = `https://wa.me`;
