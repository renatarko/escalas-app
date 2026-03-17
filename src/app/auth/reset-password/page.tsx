"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { Eye, EyeClosed } from "lucide-react";
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
import { api } from "@/trpc/react";

const formSchema = z
  .object({
    password: z
      .string({ required_error: "Informe uma nova senha" })
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
    confirmPassword: z.string({
      required_error: "Confirme a nova senha",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutate, isPending } = api.user.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    },
    onError: (error) => {
      toast.error(error.message ?? "Erro ao redefinir senha. Tente novamente.");
    },
  });

  if (!token) {
    return (
      <div className="bg-chart-2 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-muted bg-card w-full max-w-xl space-y-8 rounded-lg border p-6 shadow-lg text-center">
          <p className="text-destructive">Link inválido ou expirado.</p>
          <Link
            href="/auth/forgot-password"
            className="text-chart-3 flex justify-center text-sm hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: FormData) => {
    mutate({ token, password: data.password });
  };

  return (
    <div className="bg-chart-2 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-muted bg-card w-full max-w-xl space-y-8 rounded-lg border p-6 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Nova senha
          </h2>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              Senha redefinida com sucesso! Redirecionando para o login...
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          type={passwordVisible ? "text" : "password"}
                          className="relative block w-full appearance-none focus:outline-none sm:text-sm"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
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
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          type={confirmVisible ? "text" : "password"}
                          className="relative block w-full appearance-none focus:outline-none sm:text-sm"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() => setConfirmVisible(!confirmVisible)}
                        >
                          {confirmVisible ? <Eye /> : <EyeClosed />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                Redefinir senha
              </Button>
            </form>
          </Form>
        )}

        <Link
          href="/auth/sign-in"
          className="text-chart-3 flex justify-center text-sm hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
