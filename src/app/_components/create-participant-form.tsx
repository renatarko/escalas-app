"use client";

import z from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Separator } from "./ui/separator";
import { instrumentOptions } from "@/lib/constants";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { BandRole } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useFindCurrentBandId } from "@/lib/hooks/band";

const formSchema = z.object({
  // name: z.string().min(2, "Nome obrigatório"),
  email: z.string().min(2, "E-mail obrigatório"),
  role: z.enum([BandRole.ADMIN, BandRole.MEMBER]),
  //   instrument: z.string().min(2, "Função obrigatória"),
  instruments: z
    .array(z.string())
    .min(1, "Selecione pelo menos um instrumento"),
  // whatsapp: z
  //   .string({ required_error: "WhatsApp obrigatório" })
  //   .min(8, "WhatsApp obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export const CreateParticipantForm = () => {
  const [data, setData] = React.useState<FormData | null>(null);
  const utils = api.useUtils();

  const { bandId } = useFindCurrentBandId();

  const { mutateAsync: createInvitation, isPending: loading } =
    api.invitation.create.useMutation({
      onSuccess: async () => {
        await utils.invitation.getPendingInvitations.invalidate();
      },
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      // name: "",
      // whatsapp: "",
      instruments: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    setData(data);

    if (!bandId) {
      toast.success("Banda não encontrada");
      return;
    }

    try {
      const invite = await createInvitation({
        bandId: bandId,
        email: data.email,
        role: data.role,
        // name: data.name,
        instruments: data.instruments,
      });

      if (invite) {
        // const result = await signIn("email", {
        //   email: data.email,
        //   redirect: false,
        //   // callbackUrl,
        // });

        toast.success("Convite criado com sucesso");
        form.reset();
      }
    } catch (error) {
      const message = (error as Error) ?? "Não foi possível criar convite";
      toast.error(message.message);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-accent space-y-4 rounded-lg p-4"
        >
          <div className="flex flex-col">
            {/* <FormField
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
            /> */}

            <div className="flex items-start gap-4 space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BandRole.ADMIN}>
                            Administrador
                          </SelectItem>
                          <SelectItem value={BandRole.MEMBER}>
                            Integrante
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número WhatsApp</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    O participante receberá notificações via WhatsApp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="instruments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrumento/Função</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 space-y-2">
                      {instrumentOptions.map((option) => {
                        const isChecked = field.value?.includes(option.value);

                        return (
                          <div
                            key={option.value}
                            className="flex items-center gap-3"
                          >
                            <Checkbox
                              id={option.value}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...(field.value || []),
                                    option.value,
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(
                                      (v) => v !== option.value,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={option.value}>
                              <span className="mr-1">{option.icon}</span>
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="px-4 sm:px-16" />

          <Button
            disabled={loading}
            size="lg"
            type="submit"
            className="flex w-full"
          >
            <UserPlus />
            Convidar
          </Button>
        </form>
      </Form>
    </div>
  );
};
