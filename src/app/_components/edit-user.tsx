"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { userSchema } from "../form-schemas/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Eye, EyeClosed } from "lucide-react";
import { Separator } from "./ui/separator";

type FormData = z.infer<typeof userSchema>;

type User = {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
};

type EditUser = { user?: User };

export const EditUser = ({ user }: EditUser) => {
  const { data: session } = useSession();

  const [passwordVisible, setPasswordVisible] = useState(false);

  const { isPending: loading, mutateAsync: updateUser } =
    api.user.update.useMutation();

  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      whatsapp: user?.whatsapp ?? "",
      password: "",
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = async (data: FormData) => {
    if (!session?.user) return;
    const toastId = toast.loading("Salvando dados...");
    try {
      await updateUser({
        id: session.user.id,
        name: data.name,
        whatsapp: data.whatsapp,
        ...(data.password ? { password: data.password } : {}),
      });
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      console.log(error);
      toast.error("Erro ao salvar dados, tente novamente");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Whatsapp</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h4 className="font-semibold">Alterar senha</h4>
        <Separator />

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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || !isDirty}
        >
          Salvar
        </Button>
      </form>
    </Form>
  );
};
