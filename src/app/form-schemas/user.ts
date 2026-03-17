import z from "zod";

export const userSchema = z.object({
  name: z
    .string({ required_error: "Informe seu nome" })
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  email: z
    .string({ required_error: "E-mail obrigatório" })
    .email({ message: "Preencha com e-mail válido" }),
  whatsapp: z
    .string({ required_error: "Informe seu WhatsApp" })
    .min(10, { message: "WhatsApp inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
    .optional()
    .or(z.literal("")),
});
