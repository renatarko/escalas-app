"use client";

import React from "react";
import { Users, RefreshCw, AlertCircle, Trash } from "lucide-react";
import type z from "zod";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useFieldArray, useForm } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { DatePickerCustom } from "./ui/date-picker-month";
import { Button } from "./ui/button";
import type { Instrument } from "@/lib/types";
import {
  daysOfWeekOptions,
  instrumentOptions,
  instrumentsIcons,
  weeksOfMonthOptions,
} from "@/lib/constants";
import { createScheduleFormSchema } from "../form-schemas/schedule";

type FormData = z.infer<typeof createScheduleFormSchema>;

type ScheduleFormProps = Readonly<{
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void> | void;
  participants: {
    id: string;
    name: string;
    instruments: string[];
  }[];
  submitLabel?: string;
}>;

export default function ScheduleForm({
  defaultValues,
  onSubmit,
  participants,
  submitLabel,
}: ScheduleFormProps) {
  const form = useForm({
    resolver: zodResolver(createScheduleFormSchema),
    defaultValues: {
      scaleName: "",
      participants: [],
      date: undefined,
      recurrenceType: "SINGLE",
      time: undefined,
      notes: "",
      daysOfWeek: undefined,
      weekOfMonth: undefined,
      endDate: undefined,
      startDate: undefined,
      frequency: undefined,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const handleRecurringChange = () => {
    form.clearErrors();
    form.resetField("date");
    form.resetField("time");
    form.resetField("daysOfWeek");
    form.resetField("weekOfMonth");
    form.resetField("frequency");
  };

  const handleAddParticipant = () => {
    append({ id: "", instrument: "" });
  };

  const handleRemoveParticipant = (index: number) => {
    if (fields.length > 0) {
      remove(index);
    }
  };

  const handleReset = () => {
    form.clearErrors();
    form.resetField("time");
    form.reset();
  };

  const recurrenceType = form.watch("recurrenceType");
  const frequency = form.watch("frequency");
  const participantsSelected = form.watch("participants");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card mt-4">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="scaleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Escala</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Ensaio Geral, Rehearsal..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Agendamento</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRecurringChange();
                    }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="SINGLE"
                      className={`focus:outline-input focus-within:border-ring focus-within:ring-ring/50 hover:outline-chart-2 flex cursor-pointer items-center gap-2 rounded-lg border p-4 transition duration-150 focus-within:ring-[1px] focus-within:outline-2 hover:outline-2 sm:gap-4 sm:p-6 ${recurrenceType === "SINGLE" && "outline-chart-2 shadow-md outline-1"}`}
                    >
                      <RadioGroupItem
                        checked={recurrenceType === "SINGLE"}
                        value="SINGLE"
                        id="SINGLE"
                      />
                      <div>
                        <p>Único</p>
                        <p className="text-muted-foreground text-xs">
                          Um evento específico
                        </p>
                      </div>
                    </Label>
                    <Label
                      htmlFor="RECURRING"
                      className={`focus:outline-input focus-within:border-ring focus-within:ring-ring/50 hover:outline-chart-2 flex cursor-pointer items-center gap-2 rounded-lg border p-4 transition focus-within:ring-[1px] focus-within:outline-2 hover:outline-2 sm:gap-4 sm:p-6 ${recurrenceType === "RECURRING" && "outline-chart-2 shadow-md outline-1"}`}
                    >
                      <RadioGroupItem
                        checked={recurrenceType === "RECURRING"}
                        value="RECURRING"
                        id="RECURRING"
                      />
                      <div>
                        <p>Recorrente</p>
                        <p className="text-muted-foreground text-xs">
                          Repetir automaticamente
                        </p>
                      </div>
                    </Label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campos para evento ÚNICO */}
          {recurrenceType === "SINGLE" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePickerCustom
                        date={field.value}
                        setDate={field.onChange}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        type="time"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {recurrenceType === "RECURRING" && (
            <div className="bg-muted/50 border-input space-y-4 rounded-lg border p-6">
              <div className="flex items-center">
                <RefreshCw className="text-chart-2 mr-2 h-5 w-5" />
                <h3 className="font-semibold">Configuração de Recorrência</h3>
              </div>

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Diário</SelectItem>
                          <SelectItem value="WEEKLY">Semanal</SelectItem>
                          <SelectItem value="MONTHLY">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {frequency === "WEEKLY" && (
                <FormField
                  control={form.control}
                  name="daysOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Semana</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a semana" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeekOptions.map((week) => (
                              <SelectItem key={week.value} value={week.value}>
                                {week.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {frequency === "MONTHLY" && (
                <>
                  <FormField
                    control={form.control}
                    name="daysOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia da Semana</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a semana do mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeekOptions.map((week) => (
                                <SelectItem key={week.value} value={week.value}>
                                  {week.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weekOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel> Semana do Mês</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a semana" />
                            </SelectTrigger>
                            <SelectContent>
                              {weeksOfMonthOptions.map((week) => (
                                <SelectItem key={week.value} value={week.value}>
                                  {week.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        type="time"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <DatePickerCustom
                          date={field.value}
                          setDate={field.onChange}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término</FormLabel>
                      <FormControl>
                        <DatePickerCustom
                          date={field.value}
                          setDate={field.onChange}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Preview de Informação */}
          {recurrenceType === "RECURRING" && frequency && (
            <div className="border-chart-2/50 bg-chart-2/10 rounded-lg border p-4">
              <div className="flex items-start">
                <AlertCircle className="text-chart-2 mt-0.5 mr-3 h-5 w-5 shrink-0" />
                <div className="text-chart-2 text-sm">
                  <strong>Dica:</strong>{" "}
                  {frequency === "DAILY" &&
                    "As escalas serão criadas todos os dias no período especificado."}
                  {frequency === "WEEKLY" &&
                    "As escalas serão criadas toda semana no dia selecionado."}
                  {frequency === "MONTHLY" &&
                    "As escalas serão criadas mensalmente na semana e dia especificados."}
                </div>
              </div>
            </div>
          )}

          {/* Participantes */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="block text-lg font-semibold">
                <Users className="mr-1 inline size-5" />
                Participantes
              </Label>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddParticipant}
              >
                + Adicionar
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index + 1}
                  className="flex flex-col items-center justify-between gap-4 sm:flex-row"
                >
                  <FormField
                    control={form.control}
                    name={`participants.${index}.id`}
                    render={({ field }) => {
                      return (
                        <FormItem className="w-full">
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(selectedId) => {
                                field.onChange(selectedId);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione">
                                  {field.value
                                    ? participants?.find(
                                        (p) => p.id === field.value,
                                      )?.name
                                    : "Selecione"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {participants?.map((participant) => (
                                  <SelectItem
                                    key={participant.id}
                                    value={participant.id}
                                  >
                                    {participant.name}
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
                  <FormField
                    control={form.control}
                    name={`participants.${index}.instrument`}
                    render={({ field }) => {
                      const selectedParticipantId =
                        participantsSelected?.[index]?.id;

                      const selectedParticipant = participants?.find(
                        (p) => p.id === selectedParticipantId,
                      );

                      const instruments =
                        selectedParticipant?.instruments ?? [];

                      const availableInstruments = instrumentOptions.filter(
                        (instrument) => instruments.includes(instrument.value),
                      );

                      return (
                        <FormItem className="w-full">
                          <FormLabel>Função</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableInstruments?.map((instrument) => (
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
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => handleRemoveParticipant(index)}
                              >
                                <Trash className="size-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {fields.length === 0 && (
                <p className="text-sm italic">
                  Nenhum participante adicionado ainda
                </p>
              )}

              {form.formState.errors.participants && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.participants.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Adicione informações adicionais sobre a escala..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <Button type="submit" size="lg" className="flex-1">
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleReset}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}
