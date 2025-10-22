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

const formSchema = z.object({
  email: z
    .string({ required_error: "E-mail obrigatório para cadastro" })
    .email({ message: "Preencha com e-mail válido" }),

  password: z
    .string({ required_error: "Informe uma senha para continuar" })
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

export default function SignIn() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const toastId = toast.loading("Verificando dados...");

    const { email, password } = data;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        // callbackUrl,
      });

      toast.dismiss(toastId);

      if (result?.error) {
        toast.error("Erro ao fazer login. Verifique e-mail ou senha.");
        return;
      }

      if (result?.ok) {
        toast.success("Login realizado com sucesso!");
        setTimeout(() => {
          router.replace("/admin");
        }, 1500);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao tentar login.");
      console.log(error);
    } finally {
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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

            <Button className="w-full" size="lg" disabled={loading}>
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
