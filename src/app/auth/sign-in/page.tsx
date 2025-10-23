"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z
      .string({ required_error: "E-mail obrigatório para cadastro" })
      .email({ message: "Preencha com e-mail válido" }),
    password: z
      .string({ required_error: "Informe uma senha para continuar" })
      .optional(),
    isFromInvite: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // If not from invite, enforce password validation
    if (!data.isFromInvite) {
      if (!data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Informe uma senha para continuar",
        });
      } else if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "A senha deve ter no mínimo 6 caracteres",
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

export default function SignIn() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const emailParam = searchParams.get("email");
  const emailFromInvite = emailParam ? decodeURIComponent(emailParam) : null;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailFromInvite ?? "",
      password: "",
      isFromInvite: !!emailFromInvite,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const toastId = toast.loading("Verificando dados...");

    const { email, password } = data;

    try {
      if (emailFromInvite) {
        const result = await signIn("email", {
          email,
          // redirect: false,
          callbackUrl,
        });
        console.log({ result });
        return;
      }
      const result = await signIn("credentials", {
        email,
        password,
        // redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Erro ao fazer login. Verifique e-mail ou senha.");
        return;
      }

      if (result?.ok) {
        toast.success("Login realizado com sucesso!");
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao tentar login.");
      console.log(error);
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return (
    <div className="bg-chart-2 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-muted bg-card w-full max-w-xl space-y-8 rounded-lg border p-6 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Faça seu Login
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* {emailFromInvite && (
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
            )} */}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!!emailFromInvite}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!emailFromInvite && (
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
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              Entrar
            </Button>
          </form>
        </Form>

        <Link
          href="/auth/sign-up"
          className="text-chart-3 flex justify-center text-sm hover:underline"
        >
          Não tem uma conta? Crie uma agora!
        </Link>
      </div>
    </div>
  );
}
