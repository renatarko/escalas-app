"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getEmailFromCookie } from "@/server/utils/get-email-from-cookies";

const formSchema = z
  .object({
    name: z
      .string({ required_error: "Nome obrigarório para cadastro" })
      .min(2, "Nome obrigatório"),
    email: z
      .string({ required_error: "E-mail obrigatório para cadastro" })
      .email({ message: "Preencha com e-mail válido" }),
    whatsapp: z
      .string({ required_error: "WhatsApp obrigatório para cadastro" })
      .regex(/^\d{10,11}$/, {
        message:
          "Informe um número de WhatsApp válido com DDD (ex: 11987654321)",
      }),
    password: z
      .string({ required_error: "Informe uma senha para continuar" })
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string({
      required_error: "Confirme a senha para continuar",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"], // mostra o erro neste campo
        message: "As senhas não coincidem",
      });
    }
  });

type FormData = z.infer<typeof formSchema>;

export default function SignUp() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.has("callbackUrl");

  console.log("tem callback na url? ", callbackUrl);

  const { data: userInvited } = api.user.getByEmail.useQuery(
    { email: invitedEmail },
    { enabled: callbackUrl && invitedEmail !== "" },
  );

  const { mutateAsync: createUser, isPending: loading } =
    api.user.create.useMutation();

  const { mutateAsync: updateUser } = api.user.update.useMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (callbackUrl) {
      void getEmailFromCookie().then((email) => {
        if (email) {
          setInvitedEmail(decodeURIComponent(email));
          form.setValue("email", decodeURIComponent(email));
        }
      });
    }
  }, [form, callbackUrl]);

  const onSubmit = async (data: FormData) => {
    const { name, email, whatsapp, password } = data;

    try {
      if (callbackUrl) {
        const response = updateUser({
          id: userInvited?.id ?? "",
          name,
          whatsapp,
          password,
        });

        toast.promise(response, {
          loading: "Verificando credenciais...",
          success: () => "Conta criada com sucesso!",
          error: (err) =>
            err instanceof Error
              ? err.message
              : "Erro ao criar conta. Tente novamente.",
        });

        const userCreated = await response;

        if (userCreated) {
          router.replace("/");
        }
        return;
      }

      const promise = createUser({
        email,
        whatsapp,
        name,
        role: "USER",
        password,
      });

      toast.promise(promise, {
        loading: "Criando usuário...",
        success: () => "Conta criada com sucesso! Faça o Login",
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Erro ao criar conta. Tente novamente.",
      });

      const newUser = await promise;

      if (newUser) {
        router.replace("/auth/sign-in");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-chart-3 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-muted bg-card w-full max-w-xl space-y-8 rounded-lg border p-6 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Crie sua conta
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled={callbackUrl} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(67)999999999" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        className="relative block w-full appearance-none focus:outline-none sm:text-sm"
                        type={passwordVisible ? "text" : "password"}
                      />

                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme a Senha</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        className="relative block w-full appearance-none focus:outline-none sm:text-sm"
                        type={confirmPasswordVisible ? "text" : "password"}
                      />

                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                      >
                        {confirmPasswordVisible ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" size="lg" disabled={loading}>
              Criar conta
            </Button>
          </form>
        </Form>

        <Link
          href="/auth/sign-in"
          className="text-chart-3 flex justify-center text-sm hover:underline"
        >
          Já possuo uma conta
        </Link>
      </div>
    </div>
  );
}
