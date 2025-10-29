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
import { instrumentOptions, instrumentsIcons } from "@/lib/constants";
import type { Instrument } from "@/lib/types";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { toast } from "sonner";

const participantRowSchema = z.object({
  id: z.string({ required_error: "Selecione um participante" }),
  // name: z.string().min(1, "Selecione um participante"),
  instrument: z.string().min(1, "Selecione uma função"),
  // confirmed: z.boolean().nullable().default(null),
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
        const participantIds = participants.map((p) => p.id);
        const uniqueNames = new Set(participantIds);
        return participantIds.length === uniqueNames.size;
      },
      {
        message:
          "Não é permitido adicionar o mesmo participante mais de uma vez",
      },
    ),
});

type FormData = z.infer<typeof formSchema>;

type ParticipantRow = {
  id: string;
  // name: string;
  instrument: string;
};

export const CreateScaleForm = () => {
  const { data: session } = useSession();
  const { bandId, participants: members } = useFindCurrentBandId();

  const { mutateAsync: createSingleSchedule } =
    api.schedule.createSingle.useMutation();

  const { mutateAsync: createRecurringSchedule } =
    api.schedule.createRecurring.useMutation();

  const [participantRows, setParticipantRows] = React.useState<
    ParticipantRow[]
  >([{ id: "", instrument: "" }]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scaleName: "",
      participants: [],
      date: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    if (!bandId) {
      toast.error("Banda não encontrada");
      return;
    }

    const participantsPayload = data.participants.map((p) => ({
      participantId: p.id,
      instrument: p.instrument,
    }));

    try {
      if (data.scaleType === "weekly" && session?.user) {
        const result = await createSingleSchedule({
          bandId: bandId,
          name: data.scaleName,
          date: Array.isArray(data.date) ? data.date[0] : data.date,
          time: new Date(),
          createdById: session.user.id,
          participants: participantsPayload,
        });

        if (result.success) {
          toast.success("Escala criada com sucesso!");
          form.reset();
        }

        console.log("Schedule created:", result);
        return;
      }

      if (data.scaleType === "monthly" && session?.user) {
        const result = await createRecurringSchedule({
          bandId: bandId,
          name: data.scaleName,
          frequency: "MONTHLY",
          startDate: new Date("2025-10-28"),
          endDate: new Date("2025-11-05"),
          time: new Date(),
          dayOfWeek: 3,
          weekOfMonth: 4,
          participants: participantsPayload,
        });

        if (result.success) {
          toast.success("Escala criada com sucesso!");
          form.reset();
        }

        console.log("Schedule created:", result);
        return;
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  // Participantes já selecionados em todas as linhas
  const selectedParticipantIds = new Set<string>(
    participantRows
      .map((row) => {
        const participant = members?.find((p) => p.id === row.id);
        return participant?.id;
      })
      .filter(Boolean) as string[],
  );

  // Função para obter participantes disponíveis para uma linha específica
  const getAvailableParticipants = (currentRowId: string) => {
    const currentRow = participantRows.find((row) => row.id === currentRowId);

    return members?.filter((participant) => {
      // Se é o participante já selecionado nesta linha, mantém disponível
      if (currentRow?.id === participant.id) {
        return true;
      }
      // Remove se já foi selecionado em outra linha
      return !selectedParticipantIds.has(participant.id);
    });
  };

  const handleAddRow = () => {
    append({ id: "", instrument: "" });
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
  console.log({ participants });
  console.log(form.formState.errors);

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
                      name={`participants.${index}.id`}
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                // onValueChange={field.onChange}
                                onValueChange={(selectedId) => {
                                  // Encontra o participante pelo nome
                                  const selectedParticipant = members?.find(
                                    (p) => p.id === selectedId,
                                  );

                                  // Atualiza o nome
                                  field.onChange(selectedId);

                                  // Atualiza o ID do usuário no formulário
                                  if (selectedParticipant?.id) {
                                    form.setValue(
                                      `participants.${index}.id`,
                                      selectedParticipant.id, // ✅ ID real do usuário
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione">
                                    {field.value &&
                                      members?.find((p) => p.id === field.value)
                                        ?.name}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableParticipants(index)?.map(
                                    (participant) => (
                                      <SelectItem
                                        key={participant.id}
                                        value={participant.id ?? ""}
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
                        const selectedParticipantId = participants?.[index]?.id;

                        const selectedParticipant = members?.find(
                          (p) => p.id === selectedParticipantId,
                        );

                        const instruments =
                          selectedParticipant?.instruments ?? [];

                        const same = instrumentOptions.filter((instrument) =>
                          instruments.includes(instrument.value),
                        );

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
                                  {same?.map((instrument) => (
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
    </div>
  );
};

// const mockUsers = [
//   { id: "1", name: "João Silva", instruments: ["Guitarra", "Violão"] },
//   { id: "2", name: "Maria Santos", instruments: ["Vocal", "Teclado"] },
//   { id: "3", name: "Pedro Oliveira", instruments: ["Bateria"] },
//   { id: "4", name: "Ana Costa", instruments: ["Baixo"] },
// ];

// const daysOfWeek = [
//   { value: 0, label: "Domingo" },
//   { value: 1, label: "Segunda" },
//   { value: 2, label: "Terça" },
//   { value: 3, label: "Quarta" },
//   { value: 4, label: "Quinta" },
//   { value: 5, label: "Sexta" },
//   { value: 6, label: "Sábado" },
// ];

// const weeksOfMonth = [
//   { value: 1, label: "1ª semana" },
//   { value: 2, label: "2ª semana" },
//   { value: 3, label: "3ª semana" },
//   { value: 4, label: "4ª semana" },
//   { value: 5, label: "Última semana" },
// ];

// export default function ScheduleForm() {
//   const [formData, setFormData] = useState({
//     name: "",
//     recurrenceType: "SINGLE",
//     date: "",
//     time: "",
//     frequency: "",
//     dayOfWeek: "",
//     weekOfMonth: "",
//     startDate: "",
//     endDate: "",
//     notes: "",
//   });

//   const [participants, setParticipants] = useState([]);
//   const [errors, setErrors] = useState({});

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       scaleName: "",
//       participants: [],
//       date: undefined,
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "participants",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Limpa erro do campo ao digitar
//     if (errors[name]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Validação para evento único
//     if (formData.recurrenceType === "SINGLE") {
//       if (!formData.date) {
//         newErrors.date = "Data é obrigatória";
//       }
//     }

//     // Validação para evento recorrente
//     if (formData.recurrenceType === "RECURRING") {
//       if (!formData.frequency) {
//         newErrors.frequency = "Frequência é obrigatória";
//       }
//       if (!formData.startDate) {
//         newErrors.startDate = "Data de início é obrigatória";
//       }
//       if (!formData.endDate) {
//         newErrors.endDate = "Data de término é obrigatória";
//       }

//       // Validação específica por frequência
//       if (
//         formData.frequency === "WEEKLY" ||
//         formData.frequency === "BIWEEKLY"
//       ) {
//         if (!formData.dayOfWeek) {
//           newErrors.dayOfWeek = "Dia da semana é obrigatório";
//         }
//       }

//       if (formData.frequency === "MONTHLY") {
//         if (!formData.dayOfWeek) {
//           newErrors.dayOfWeek = "Dia da semana é obrigatório";
//         }
//         if (!formData.weekOfMonth) {
//           newErrors.weekOfMonth = "Semana do mês é obrigatória";
//         }
//       }

//       // Validação de datas
//       if (formData.startDate && formData.endDate) {
//         if (new Date(formData.startDate) > new Date(formData.endDate)) {
//           newErrors.endDate =
//             "Data de término deve ser posterior à data de início";
//         }
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     const finalData = {
//       ...formData,
//       participants: participants.filter((p) => p.participantId && p.instrument),
//     };

//     console.log("Dados do formulário:", finalData);
//     alert("Formulário enviado com sucesso! Veja o console para os dados.");
//   };

//   const addParticipant = () => {
//     setParticipants([...participants, { participantId: "", instrument: "" }]);
//   };

//   const removeParticipant = (index) => {
//     setParticipants(participants.filter((_, i) => i !== index));
//   };

//   const updateParticipant = (index, field, value) => {
//     const updated = [...participants];
//     updated[index] = { ...updated[index], [field]: value };
//     setParticipants(updated);
//   };

//   const handleReset = () => {
//     setFormData({
//       name: "",
//       recurrenceType: "SINGLE",
//       date: "",
//       time: "",
//       frequency: "",
//       dayOfWeek: "",
//       weekOfMonth: "",
//       startDate: "",
//       endDate: "",
//       notes: "",
//     });
//     setParticipants([]);
//     setErrors({});
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
//       <div className="mx-auto max-w-3xl">
//         <div className="rounded-2xl bg-white p-8 shadow-xl">
//           <div className="mb-8">
//             <h1 className="mb-2 text-3xl font-bold text-slate-800">
//               Criar Nova Escala
//             </h1>
//             <p className="text-slate-600">
//               Configure ensaios únicos ou recorrentes para sua banda
//             </p>
//           </div>

//           <div className="space-y-6">
//             {/* Nome do Evento */}
//             <div>
//               <label className="mb-2 block text-sm font-medium text-slate-700">
//                 Nome do Evento (Opcional)
//               </label>
//               <input
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 type="text"
//                 placeholder="Ex: Ensaio Geral, Rehearsal..."
//                 className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Tipo de Recorrência */}
//             <div>
//               <label className="mb-3 block text-sm font-medium text-slate-700">
//                 Tipo de Agendamento
//               </label>
//               <div className="grid grid-cols-2 gap-4">
//                 <label
//                   className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition ${
//                     formData.recurrenceType === "SINGLE"
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-slate-300 hover:border-slate-400"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="recurrenceType"
//                     value="SINGLE"
//                     checked={formData.recurrenceType === "SINGLE"}
//                     onChange={handleChange}
//                     className="mr-3"
//                   />
//                   <div>
//                     <div className="font-medium text-slate-800">Único</div>
//                     <div className="text-sm text-slate-600">
//                       Um evento específico
//                     </div>
//                   </div>
//                 </label>

//                 <label
//                   className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition ${
//                     formData.recurrenceType === "RECURRING"
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-slate-300 hover:border-slate-400"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="recurrenceType"
//                     value="RECURRING"
//                     checked={formData.recurrenceType === "RECURRING"}
//                     onChange={handleChange}
//                     className="mr-3"
//                   />
//                   <div>
//                     <div className="font-medium text-slate-800">Recorrente</div>
//                     <div className="text-sm text-slate-600">
//                       Repetir automaticamente
//                     </div>
//                   </div>
//                 </label>
//               </div>
//             </div>

//             {/* Campos para evento ÚNICO */}
//             {formData.recurrenceType === "SINGLE" && (
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-slate-700">
//                     <Calendar className="mr-1 inline h-4 w-4" />
//                     Data
//                   </label>
//                   <input
//                     name="date"
//                     value={formData.date}
//                     onChange={handleChange}
//                     type="date"
//                     className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {errors.date && (
//                     <p className="mt-1 text-sm text-red-500">{errors.date}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-slate-700">
//                     <Clock className="mr-1 inline h-4 w-4" />
//                     Horário
//                   </label>
//                   <input
//                     name="time"
//                     value={formData.time}
//                     onChange={handleChange}
//                     type="time"
//                     className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Campos para evento RECORRENTE */}
//             {formData.recurrenceType === "RECURRING" && (
//               <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
//                 <div className="mb-2 flex items-center">
//                   <RefreshCw className="mr-2 h-5 w-5 text-blue-600" />
//                   <h3 className="font-semibold text-slate-800">
//                     Configuração de Recorrência
//                   </h3>
//                 </div>

//                 <div>
//                   <Label className="mb-2 block text-sm font-medium text-slate-700">
//                     Frequência
//                   </Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Selecione a frequência" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {/* <SelectItem value="">Selecione a frequência</SelectItem> */}
//                       <SelectItem value="DAILY">Diário</SelectItem>
//                       <SelectItem value="WEEKLY">Semanal</SelectItem>
//                       <SelectItem value="BIWEEKLY">Quinzenal</SelectItem>
//                       <SelectItem value="MONTHLY">Mensal</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <select
//                     name="frequency"
//                     value={formData.frequency}
//                     onChange={handleChange}
//                     className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Selecione a frequência</option>
//                     <option value="DAILY">Diário</option>
//                     <option value="WEEKLY">Semanal</option>
//                     <option value="BIWEEKLY">Quinzenal</option>
//                     <option value="MONTHLY">Mensal</option>
//                   </select>
//                   {errors.frequency && (
//                     <p className="mt-1 text-sm text-red-500">
//                       {errors.frequency}
//                     </p>
//                   )}
//                 </div>

//                 {formData.frequency && formData.frequency !== "DAILY" && (
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Dia da Semana
//                     </label>
//                     <select
//                       name="dayOfWeek"
//                       value={formData.dayOfWeek}
//                       onChange={handleChange}
//                       className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Selecione o dia</option>
//                       {daysOfWeek.map((day) => (
//                         <option key={day.value} value={day.value}>
//                           {day.label}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.dayOfWeek && (
//                       <p className="mt-1 text-sm text-red-500">
//                         {errors.dayOfWeek}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {formData.frequency === "MONTHLY" && (
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Semana do Mês
//                     </label>
//                     <select
//                       name="weekOfMonth"
//                       value={formData.weekOfMonth}
//                       onChange={handleChange}
//                       className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Selecione a semana</option>
//                       {weeksOfMonth.map((week) => (
//                         <option key={week.value} value={week.value}>
//                           {week.label}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.weekOfMonth && (
//                       <p className="mt-1 text-sm text-red-500">
//                         {errors.weekOfMonth}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-slate-700">
//                     <Clock className="mr-1 inline h-4 w-4" />
//                     Horário
//                   </label>
//                   <input
//                     name="time"
//                     value={formData.time}
//                     onChange={handleChange}
//                     type="time"
//                     className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Data de Início
//                     </label>
//                     <input
//                       name="startDate"
//                       value={formData.startDate}
//                       onChange={handleChange}
//                       type="date"
//                       className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     {errors.startDate && (
//                       <p className="mt-1 text-sm text-red-500">
//                         {errors.startDate}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-700">
//                       Data de Término
//                     </label>
//                     <input
//                       name="endDate"
//                       value={formData.endDate}
//                       onChange={handleChange}
//                       type="date"
//                       className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     {errors.endDate && (
//                       <p className="mt-1 text-sm text-red-500">
//                         {errors.endDate}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Participantes */}
//             <div>
//               <div className="mb-3 flex items-center justify-between">
//                 <label className="block text-sm font-medium text-slate-700">
//                   <Users className="mr-1 inline h-4 w-4" />
//                   Participantes
//                 </label>
//                 <button
//                   type="button"
//                   onClick={addParticipant}
//                   className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white transition hover:bg-green-600"
//                 >
//                   + Adicionar
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {participants.map((participant, index) => (
//                   <div key={index} className="flex items-start gap-3">
//                     <select
//                       value={participant.participantId}
//                       onChange={(e) =>
//                         updateParticipant(
//                           index,
//                           "participantId",
//                           e.target.value,
//                         )
//                       }
//                       className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Selecione o músico</option>
//                       {mockUsers.map((user) => (
//                         <option key={user.id} value={user.id}>
//                           {user.name}
//                         </option>
//                       ))}
//                     </select>

//                     <input
//                       type="text"
//                       placeholder="Instrumento"
//                       value={participant.instrument}
//                       onChange={(e) =>
//                         updateParticipant(index, "instrument", e.target.value)
//                       }
//                       className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//                     />

//                     <button
//                       type="button"
//                       onClick={() => removeParticipant(index)}
//                       className="rounded-lg bg-red-500 px-4 py-3 text-white transition hover:bg-red-600"
//                     >
//                       Remover
//                     </button>
//                   </div>
//                 ))}

//                 {participants.length === 0 && (
//                   <p className="text-sm text-slate-500 italic">
//                     Nenhum participante adicionado ainda
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Observações */}
//             <div>
//               <label className="mb-2 block text-sm font-medium text-slate-700">
//                 Observações
//               </label>
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={4}
//                 placeholder="Adicione informações adicionais sobre o ensaio..."
//                 className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Botões */}
//             <div className="flex gap-4 pt-4">
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
//               >
//                 Criar Escala
//               </button>
//               <button
//                 type="button"
//                 onClick={handleReset}
//                 className="rounded-lg border-2 border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
//               >
//                 Limpar
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Preview de Informação */}
//         {formData.recurrenceType === "RECURRING" && formData.frequency && (
//           <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
//             <div className="flex items-start">
//               <AlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
//               <div className="text-sm text-blue-800">
//                 <strong>Dica:</strong>{" "}
//                 {formData.frequency === "DAILY" &&
//                   "Os ensaios serão criados todos os dias no período especificado."}
//                 {formData.frequency === "WEEKLY" &&
//                   "Os ensaios serão criados toda semana no dia selecionado."}
//                 {formData.frequency === "BIWEEKLY" &&
//                   "Os ensaios serão criados a cada duas semanas no dia selecionado."}
//                 {formData.frequency === "MONTHLY" &&
//                   "Os ensaios serão criados mensalmente na semana e dia especificados."}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
