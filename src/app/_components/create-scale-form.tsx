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
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DatePickerMonth } from "./ui/date-picker-month";
import React from "react";
import { Plus, Trash } from "lucide-react";
import { Separator } from "./ui/separator";
import { ScaleCard } from "./scale-card";
import { instrumentsIcons } from "@/lib/constants";
import type { Instrument } from "@/lib/types";
import { api } from "@/trpc/react";

const participantRowSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Selecione um participante"),
  instrument: z.string().min(1, "Selecione uma função"),
  confirmed: z.boolean().nullable().default(null),
});

const formSchema = z.object({
  scaleName: z.string().min(2, {
    message: "Dê um nome para a escala",
  }),
  scaleType: z.enum(["weekly", "monthly"], {
    required_error: "Selecione uma opção",
  }),
  date: z.date().or(z.array(z.date())),
  participants: z
    .array(participantRowSchema)
    .min(1, "Adicione pelo menos um participante")
    .refine(
      (participants) => {
        // Verifica se não há participantes duplicados
        const participantNames = participants.map((p) => p.name);
        const uniqueNames = new Set(participantNames);
        return participantNames.length === uniqueNames.size;
      },
      {
        message:
          "Não é permitido adicionar o mesmo participante mais de uma vez",
      },
    ),
});

type FormData = z.infer<typeof formSchema>;

const participantsList = [
  {
    userId: "1",
    name: "Renata Karolina",
    instruments: [
      { value: "guitar", label: "Violão" },
      { value: "vocal", label: "Vocal" },
    ],
  },
  {
    userId: "2",
    name: "Felipe Araujo",
    instruments: [{ value: "vocal", label: "Vocal" }],
  },
  {
    userId: "3",
    name: "Lucas Mendes",
    instruments: [{ value: "drum", label: "Bateria" }],
  },
  {
    userId: "4",
    name: "Ana Júlia",
    instruments: [
      { value: "vocal", label: "Vocal" },
      { value: "guitar", label: "Violão" },
      { value: "keyboard", label: "Teclado" },
    ],
  },
];

type ParticipantRow = {
  userId: string;
  participant: string;
  instrument: string;
};

export const CreateScaleForm = () => {
  const { mutateAsync: createSingleSchedule } =
    api.schedule.createSingle.useMutation();

  const [data, setData] = React.useState<FormData[] | null>(null);
  const [participantRows, setParticipantRows] = React.useState<
    ParticipantRow[]
  >([{ userId: crypto.randomUUID(), participant: "", instrument: "" }]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scaleName: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    setData((prevData) => (prevData ? [...prevData, data] : [data]));

    try {
      if (data.scaleType === "weekly") {
        const result = await createSingleSchedule({
          date: Array.isArray(data.date) ? data.date[0] : data.date,
          time: new Date(),
          createdById: "user-123",
          participants: data.participants,
        });

        console.log("Schedule created:", result);
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  // Participantes já selecionados em todas as linhas
  const selectedParticipantIds = new Set<string>(
    participantRows
      .map((row) => {
        const participant = participantsList.find(
          (p) => p.name === row.participant,
        );
        return participant?.userId;
      })
      .filter((id): id is string => Boolean(id)),
  );

  // Função para obter participantes disponíveis para uma linha específica
  const getAvailableParticipants = (currentRowId: string) => {
    const currentRow = participantRows.find(
      (row) => row.userId === currentRowId,
    );

    return participantsList.filter((participant) => {
      // Se é o participante já selecionado nesta linha, mantém disponível
      if (currentRow?.participant === participant.name) {
        return true;
      }
      // Remove se já foi selecionado em outra linha
      return !selectedParticipantIds.has(participant.userId);
    });
  };

  const handleAddRow = () => {
    append({ userId: crypto.randomUUID(), name: "", instrument: "" });
  };

  // Função para remover linha
  const handleRemoveRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const datePicketMode =
    form.watch("scaleType") === "weekly" ? "daily" : "monthly";

  const participants = form.watch("participants");

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-accent space-y-4 rounded-lg p-4"
        >
          <div className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="scaleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Escala</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scaleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione freguência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Diária</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Diária você selecionará apenas uma dia específico. Mensal
                    será possível ter vários dias do mesmo dia da semana em
                    diferentes meses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <DatePickerMonth
                      mode={datePicketMode}
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="px-4 sm:px-16" />

          <div className="space-y-4 p-4">
            <h3>Adicionar Integrantes</h3>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`participants.${index}.name`}
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableParticipants(index).map(
                                    (participant) => (
                                      <SelectItem
                                        key={participant.userId}
                                        value={participant.name}
                                      >
                                        {participant.name}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={`participants.${index}.instrument`}
                      render={({ field }) => {
                        const selectedParticipantName =
                          participants?.[index]?.name;

                        const selectedParticipant = participantsList.find(
                          (p) => p.name === selectedParticipantName,
                        );

                        const instruments =
                          selectedParticipant?.instruments ?? [];

                        return (
                          <FormItem>
                            <FormLabel>Função</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {instruments.map((instrument) => (
                                    <SelectItem
                                      key={instrument.value}
                                      value={instrument.value}
                                    >
                                      <span className="mr-1">
                                        {
                                          instrumentsIcons[
                                            instrument.value as Instrument
                                          ]
                                        }
                                      </span>{" "}
                                      {instrument.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveRow(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              size="icon"
              type="button"
              onClick={handleAddRow}
              className="flex justify-self-center rounded-full"
            >
              <Plus />
            </Button>
          </div>

          <Button size="lg" type="submit" className="flex w-full">
            Criar escala
          </Button>
        </form>
      </Form>

      {data &&
        data.length > 0 &&
        data.map((scale) => (
          <ScaleCard
            name={scale.scaleName}
            status={"waiting_confirmation"}
            participants={scale.participants}
            key={scale.scaleName}
          />
        ))}
    </div>
  );
};
