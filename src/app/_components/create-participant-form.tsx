"use client";

import z from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { CreatedParticipant } from "./created-participant";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().min(2, "E-mail obrigatório"),
  //   instrument: z.string().min(2, "Função obrigatória"),
  instruments: z
    .array(z.string())
    .min(1, "Selecione pelo menos um instrumento"),
  whatsapp: z
    .string({ required_error: "WhatsApp obrigatório" })
    .min(8, "WhatsApp obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export const CreateParticipantForm = () => {
  const [data, setData] = React.useState<FormData | null>(null);

  const { data: bands } = api.band.getBands.useQuery();

  const { mutateAsync: createInvitation } = api.invitation.create.useMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      instruments: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    setData(data);

    try {
      const invite = await createInvitation({
        bandId: !!bands && bands?.length > 0 ? bands[0]?.id : "",
        email: data.email,
        name: data.name,
        instruments: data.instruments,
      });

      if (invite) {
        form.reset();
        toast.success("Convite criado com sucesso");
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
          <h5 className="flex items-center gap-2 font-semibold">
            <UserPlus className="size-4" />
            Convidar Integrante
          </h5>
          <div className="space-y-4 p-4">
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
            />

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

          <Button size="lg" type="submit" className="flex w-full">
            <UserPlus />
            Convidar
          </Button>
        </form>
      </Form>
    </div>
  );
};
