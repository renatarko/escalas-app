import {
  Calendar,
  MessageCircle,
  Users,
  Zap,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import featureWhatsapp from "@/assets/feature-whatsapp.png";
import featureSchedule from "@/assets/feature-schedule.png";
import featureTeam from "@/assets/feature-team.png";

export const features = [
  {
    icon: Calendar,
    title: "Gestão de Escalas",
    description:
      "Crie e gerencie escalas de forma intuitiva com calendário visual e organização por eventos.",
    image: featureSchedule,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Automatizado",
    description:
      "Envie confirmações automáticas via WhatsApp e receba respostas em tempo real.",
    image: featureWhatsapp,
  },
  {
    icon: Users,
    title: "Gestão de Membros",
    description:
      "Cadastre músicos com seus instrumentos e mantenha todo o time organizado.",
    image: featureTeam,
  },
];

export const benefits = [
  { icon: Zap, text: "Configuração em minutos" },
  { icon: Shield, text: "Dados seguros na nuvem" },
  { icon: Clock, text: "Economize horas de trabalho" },
  { icon: Star, text: "Suporte dedicado" },
];

export const plans = [
  {
    name: "Starter",
    price: "R$ 9,99",
    description: "Para bandas pequenas",
    features: [
      "Até 10 membros",
      "5 escalas por mês",
      "Notificações básicas",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 24,99",
    period: "/mês",
    description: "Para bandas ativas",
    features: [
      "Membros ilimitados",
      "Escalas ilimitadas",
      "WhatsApp automatizado",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    popular: true,
  },
  //   {
  //     name: "Enterprise",
  //     price: "Sob consulta",
  //     description: "Para igrejas e organizações",
  //     features: [
  //       "Múltiplas bandas",
  //       "API personalizada",
  //       "Integrações customizadas",
  //       "Gerente de conta dedicado",
  //       "SLA garantido",
  //     ],
  //     popular: false,
  //   },
];

export const howStartSteps = [
  {
    step: "1",
    title: "Crie a escala",
    description: "Defina data, local e adicione os músicos participantes",
  },
  {
    step: "2",
    title: "Envie via WhatsApp",
    description: "Com um clique, todos recebem a notificação no WhatsApp",
  },
  {
    step: "3",
    title: "Receba confirmações",
    description: "Os músicos respondem SIM ou NÃO e você vê tudo em tempo real",
  },
];

export const testimonials = [
  {
    name: "Pastor João",
    role: "Igreja Batista Central",
    text: "O Escalas App revolucionou a forma como organizamos o ministério de louvor. Economizamos horas toda semana!",
  },
  {
    name: "Maria Silva",
    role: "Líder de Louvor",
    text: "Antes eu passava horas no WhatsApp cobrando confirmação. Agora é tudo automático e em tempo real.",
  },
  {
    name: "Carlos Santos",
    role: "Músico",
    text: "Super fácil de usar! Recebo a escala no WhatsApp e confirmo em segundos. Sem complicação.",
  },
];
