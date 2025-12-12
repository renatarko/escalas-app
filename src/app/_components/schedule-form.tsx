"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  AlertCircle,
  Trash,
  Sparkles,
  Plus,
} from "lucide-react";
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
import { api } from "@/trpc/react";
import { Checkbox } from "./ui/checkbox";
import { DialogScheduleForm } from "./dialogs/dialog-schedule-form";

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
  loading: boolean;
  isEdit?: boolean;
  shouldResetForm?: boolean;
  bandId: string;
}>;

export default function ScheduleForm({
  defaultValues,
  onSubmit,
  participants,
  submitLabel,
  loading,
  isEdit = false,
  shouldResetForm = false,
  bandId,
}: ScheduleFormProps) {
  const [previewStats, setPreviewStats] = useState({
    defined: 0,
    pending: 0,
    total: 0,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [showInstrumentDialog, setShowInstrumentDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedInstrumentsToAdd, setSelectedInstrumentsToAdd] = useState<
    string[]
  >([]);
  const [selectedInstrumentsToPreview, setSelectedInstrumentsToPreview] =
    useState<{ instrument: string; quantity: string }[]>([]);

  const { mutateAsync: generatePreview, isPending: isGeneratingPreview } =
    api.schedule.generateMembersPreview.useMutation({
      onSuccess: () => setShowPreviewDialog(false),
    });

  const form = useForm<FormData>({
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

  const handleGeneratePreview = async () => {
    try {
      const formation = selectedInstrumentsToPreview.reduce(
        (acc, item) => {
          acc[item.instrument] = Number(item.quantity);
          return acc;
        },
        {} as Record<string, number>,
      );

      const result = await generatePreview({ bandId, formation });

      if (result && result.length > 0) {
        // Mapeia para o formato esperado pelo formulário
        const mappedParticipants = result.map((member) => ({
          id: member.userId,
          name: member.name,
          instrument: member.instrument,
        }));

        form.setValue("participants", mappedParticipants);
        const defined = result.filter((m) => !m.placeholder).length;
        const pending = result.filter((m) => m.placeholder).length;

        setPreviewStats({
          defined,
          pending,
          total: result.length,
        });
      }
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
    }
  };

  const handleAddParticipant = (instrument: Instrument, i: number) => {
    append({ id: `id-${i}`, instrument });
    updateStats();
  };

  const handleRemoveParticipant = (index: number) => {
    if (fields.length > 0) {
      remove(index);
      updateStats();
    }
  };

  const updateStats = () => {
    const currentParticipants = form.getValues("participants");
    console.log({ currentParticipants });
    setPreviewStats({
      defined: currentParticipants.filter((p) => p.id).length,
      pending: currentParticipants.filter((p) => !p.id).length,
      total: currentParticipants.length,
    });
  };

  const handleReset = () => {
    form.clearErrors();
    form.resetField("time");
    form.reset();
    setPreviewStats({ defined: 0, pending: 0, total: 0 });
  };

  const handleAddInstruments = () => {
    if (selectedInstrumentsToAdd.length > 0) {
      selectedInstrumentsToAdd.forEach((instrument) => {
        append({ id: "", instrument });
      });
      setSelectedInstrumentsToAdd([]);
      setShowInstrumentDialog(false);
    }
  };

  const toggleInstrumentSelection = (instrumentValue: string) => {
    setSelectedInstrumentsToAdd((prev) =>
      prev.includes(instrumentValue)
        ? prev.filter((i) => i !== instrumentValue)
        : [...prev, instrumentValue],
    );
  };

  const handleInstrumentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    instrumentValue: string,
  ) => {
    let quantity = e.target.value;
    const numericValue = parseInt(quantity, 10);
    if (numericValue > 10) {
      quantity = "10";
      e.target.value = "10"; // Atualiza o input visualmente
    }
    setSelectedInstrumentsToPreview((prev) => {
      if (!quantity || quantity === "0") {
        return prev.filter((item) => item.instrument !== instrumentValue);
      }

      const existingIndex = prev.findIndex(
        (item) => item.instrument === instrumentValue,
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { instrument: instrumentValue, quantity };
        return updated;
      }

      return [...prev, { instrument: instrumentValue, quantity }];
    });
  };

  const handleClearInputs = () => {
    setSelectedInstrumentsToPreview([]);
    // Reseta todos os inputs do tipo number
    instrumentOptions.forEach((instrument) => {
      const input = document.getElementById(
        instrument.value,
      ) as HTMLInputElement;
      if (input) {
        input.value = "";
      }
    });
  };

  const recurrenceType = form.watch("recurrenceType");
  const frequency = form.watch("frequency");
  const participantsSelected = form.watch("participants");

  const addedInstruments = new Set(
    (participantsSelected || []).map((p) => p.instrument).filter(Boolean),
  );

  const availableInstrumentsToAdd = instrumentOptions.filter(
    (inst) => !addedInstruments.has(inst.value),
  );

  const groupedParticipants = (participantsSelected || []).reduce(
    (acc, participant) => {
      const instrument = participant.instrument;
      if (instrument) {
        acc[instrument] ??= [];
        acc[instrument].push(participant);
      }
      return acc;
    },
    {} as Record<string, typeof participantsSelected>,
  );

  useEffect(() => {
    if (shouldResetForm) {
      form.reset();
      setPreviewStats({ defined: 0, pending: 0, total: 0 });
    }
  }, [shouldResetForm, form]);

  useEffect(() => {
    if (!isInitialized && !isEdit && fields.length === 0) {
      const defaultInstruments = [
        "guitar",
        "keyboard",
        "vocal",
        "drum",
        "bass",
      ];
      const defaultParticipants = defaultInstruments.map((instrument) => ({
        id: "",
        instrument,
      }));
      form.setValue("participants", defaultParticipants);
      setIsInitialized(true);
      updateStats();
    }
  }, [isInitialized, isEdit, append, selectedInstrumentsToAdd, fields, form]);

  useEffect(() => {
    if (isEdit) {
      for (const key in defaultValues) {
        form.setValue(key as keyof FormData, defaultValues[key]);
      }
    }
  }, [defaultValues, isEdit, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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

          {!isEdit && (
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
          )}

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
          <div className="py-6">
            <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Label className="block text-lg font-semibold">
                <Users className="mr-1 inline size-5" />
                Participantes
              </Label>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowInstrumentDialog(true)}
                >
                  + Instrumento
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowPreviewDialog(true)}
                  disabled={isGeneratingPreview}
                >
                  {isGeneratingPreview ? "Gerando..." : "Gerar Automático"}
                </Button>
              </div>
            </div>

            {previewStats.total > 0 && (
              <div className="border-muted bg-primary/10 my-4 flex items-center gap-2 rounded-md p-2">
                <Sparkles className="text-primary h-4 w-4" />
                <p className="text-sm">
                  <strong>Preview gerado:</strong> {previewStats.defined}{" "}
                  integrantes definidos{" "}
                  {previewStats.pending > 0 && (
                    <span className="text-orange-600">
                      ({previewStats.pending} posições pendentes)
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groupedParticipants).map(
                ([instrument, members], i) => {
                  const availableForInstrument = participants.filter((p) =>
                    p.instruments.includes(instrument),
                  );

                  return (
                    <div
                      key={instrument}
                      className="rounded-lg border bg-linear-to-br from-gray-50 to-gray-100 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary ml-auto rounded-full px-2 py-0.5 text-xs text-white">
                            {members.length}
                          </span>
                          <span className="text-lg">
                            {instrumentsIcons[instrument as Instrument]}
                          </span>
                          <span className="text-sm font-semibold">
                            {instrumentOptions.find(
                              (inst) => inst.value === instrument,
                            )?.label ?? instrument}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={() =>
                            handleAddParticipant(instrument as Instrument, i)
                          }
                          variant="link"
                          size="sm"
                          className="self-end"
                        >
                          <Plus /> Adicionar
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {members.map((member, memberIndex) => {
                          const fieldIndex = fields.findIndex((f, idx) => {
                            const currentParticipant =
                              participantsSelected[idx];
                            return (
                              currentParticipant?.id === member.id &&
                              currentParticipant?.instrument === instrument
                            );
                          });

                          // Se não encontrou o índice, não renderiza
                          if (fieldIndex === -1) return null;

                          const currentValue =
                            participantsSelected[fieldIndex]?.id;
                          const selectedParticipant = participants.find(
                            (p) => p.id === currentValue,
                          );

                          return (
                            <div
                              key={`${member.id}-${instrument}-${memberIndex}`}
                              className="space-y-1"
                            >
                              <FormField
                                control={form.control}
                                name={`participants.${fieldIndex}.id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center gap-2">
                                        <Select
                                          value={field.value}
                                          onValueChange={(e) => {
                                            field.onChange(e);
                                            updateStats();
                                          }}
                                        >
                                          <SelectTrigger className="h-9 w-full text-xs">
                                            <SelectValue placeholder="Selecione">
                                              {selectedParticipant?.name ??
                                                "Selecione"}
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableForInstrument.length <
                                            1 ? (
                                              <p className="w-fit p-2 text-sm">
                                                Não há integrantes para este
                                                Instrumento/Função
                                              </p>
                                            ) : (
                                              availableForInstrument.map(
                                                (participant) => (
                                                  <SelectItem
                                                    key={participant.id}
                                                    value={participant.id}
                                                  >
                                                    {participant.name}
                                                  </SelectItem>
                                                ),
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="h-9 w-9 shrink-0"
                                          onClick={() =>
                                            handleRemoveParticipant(fieldIndex)
                                          }
                                        >
                                          <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <div className="">
              {fields.length === 0 && (
                <p className="text-muted-foreground text-sm italic">
                  Nenhum participante adicionado ainda. Use o botão{" "}
                  <b>Gerar Preview</b> para sugestões automáticas!
                </p>
              )}

              {form.formState.errors.participants && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.participants.root?.message}
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
          <Button disabled={loading} type="submit" size="lg" className="flex-1">
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            size="lg"
            onClick={handleReset}
          >
            Limpar
          </Button>
        </div>
      </form>

      <DialogScheduleForm
        open={showInstrumentDialog}
        setOpen={setShowInstrumentDialog}
        title="Adicionar Instrumento"
        description="
         Selecione os instrumentos que deseja adicionar à escala:"
        handleCleanClick={() => {
          setSelectedInstrumentsToAdd([]);
          setShowInstrumentDialog(false);
        }}
        handleConfirmClick={handleAddInstruments}
        disabled={selectedInstrumentsToAdd.length === 0}
        labelBtnConfirm={
          selectedInstrumentsToAdd.length > 0
            ? `Adicionar (${selectedInstrumentsToAdd.length})`
            : "Adicionar"
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {availableInstrumentsToAdd.length > 0 ? (
            availableInstrumentsToAdd.map((instrument) => (
              <Label
                key={instrument.value}
                htmlFor={instrument.value}
                className={`hover:bg-muted/50 border-muted flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all ${
                  selectedInstrumentsToAdd.includes(instrument.value)
                    ? "border-primary bg-gray-50"
                    : "border-muted"
                }`}
              >
                <Checkbox
                  checked={selectedInstrumentsToAdd.includes(instrument.value)}
                  id={instrument.value}
                  onCheckedChange={() =>
                    toggleInstrumentSelection(instrument.value)
                  }
                />
                <span className="text-2xl">
                  {instrumentsIcons[instrument.value as Instrument]}
                </span>
                <span className="font-medium">{instrument.label}</span>
              </Label>
            ))
          ) : (
            <div className="bg-card col-span-full rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Todos os instrumentos já foram adicionados
              </p>
            </div>
          )}
        </div>
      </DialogScheduleForm>

      <DialogScheduleForm
        open={showPreviewDialog}
        setOpen={setShowPreviewDialog}
        title="Adicionar Integrantes"
        description="
        Informe os instrumetos e a quantidade de integrantes para cada
                    função"
        handleCleanClick={handleClearInputs}
        handleConfirmClick={handleGeneratePreview}
        disabled={
          selectedInstrumentsToPreview.length === 0 || isGeneratingPreview
        }
        labelBtnClose="Limpar"
        labelBtnConfirm="Gerar Preview"
      >
        <div className="grid grid-cols-2 gap-4">
          {instrumentOptions.map((instrument) => (
            <Label
              key={instrument.value}
              htmlFor={instrument.value}
              className={`hover:bg-muted/50 flex cursor-pointer flex-col items-start justify-between gap-1 p-2 transition-all sm:flex-row sm:items-center`}
            >
              <div className="flex items-center gap-2">
                <span className="sm:text-2xl">
                  {instrumentsIcons[instrument.value as Instrument]}
                </span>
                <span className="font-medium">{instrument.label}</span>
              </div>

              <Input
                id={instrument.value}
                type="number"
                className="h-10 w-full sm:w-16"
                placeholder="0"
                onChange={(e) => handleInstrumentChange(e, instrument.value)}
                value={
                  selectedInstrumentsToPreview.find(
                    (item) => item.instrument === instrument.value,
                  )?.quantity
                }
                min={1}
                max={10}
              />
            </Label>
          ))}
        </div>
      </DialogScheduleForm>
    </Form>
  );
}
