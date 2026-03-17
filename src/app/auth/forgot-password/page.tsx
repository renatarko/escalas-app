"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
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

const formSchema = z.object({
  email: z
    .string({ required_error: "E-mail obrigatório" })
    .email({ message: "Preencha com e-mail válido" }),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const { mutate, isPending } = api.user.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast.error("Erro ao enviar email. Tente novamente.");
    },
  });

  const onSubmit = (data: FormData) => {
    mutate({ email: data.email });
  };

  return (
    <div className="bg-chart-2 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-muted bg-card w-full max-w-xl space-y-8 rounded-lg border p-6 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Esqueci minha senha
          </h2>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              Se o e-mail informado estiver cadastrado, você receberá um link
              para redefinir sua senha em breve.
            </p>
            <Link
              href="/auth/sign-in"
              className="text-chart-3 flex justify-center text-sm hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-center text-sm">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isPending}
                >
                  Enviar link de redefinição
                </Button>
              </form>
            </Form>

            <Link
              href="/auth/sign-in"
              className="text-chart-3 flex justify-center text-sm hover:underline"
            >
              Voltar para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
