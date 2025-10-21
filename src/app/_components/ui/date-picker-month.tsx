import { useState } from "react";
import { format, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, CalendarSync } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";

interface DatePickerProps {
  date: Date | Date[] | undefined;
  setDate: (date: Date | Date[] | undefined) => void;
  mode: "daily" | "monthly";
}

export function DatePickerMonth({ mode, date, setDate }: DatePickerProps) {
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(-1);

  const daysOfWeek = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
  ];

  const getDisplayText = () => {
    if (!date) return "Escolha uma data";

    if (mode === "daily") {
      // Para modo daily, apenas uma data
      if (Array.isArray(date)) {
        return date.length > 0
          ? format(date[0], "PPP", { locale: ptBR })
          : "Escolha uma data";
      }
      return format(date, "PPP", { locale: ptBR });
    } else {
      // Para modo monthly, mostra o dia da semana selecionado
      if (Array.isArray(date) && date.length > 0) {
        const dayOfWeek = getDay(date[0]);
        const dayName =
          daysOfWeek.find((d) => d.value === dayOfWeek)?.label.split("-")[0] ??
          "";
        return `Toda ${dayName} dos meses selecionados`;
      }
      return "Escolha os meses";
    }
  };

  const handleDailySelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleMonthlySelect = (selectedDates: Date[] | undefined) => {
    if (!selectedDates || selectedDates.length === 0) {
      setDate(undefined);
      return;
    }

    // Se é a primeira seleção, define o dia da semana base
    if (!Array.isArray(date) || date.length === 0) {
      const firstDay = getDay(selectedDates[0]);
      setSelectedDayOfWeek(firstDay);
      setDate(selectedDates);
      return;
    }

    // Verifica se todas as datas são do mesmo dia da semana
    const newDate = selectedDates[selectedDates.length - 1];
    const newDayOfWeek = getDay(newDate);

    if (newDayOfWeek === selectedDayOfWeek) {
      // Mesmo dia da semana, adiciona à seleção
      setDate(selectedDates);
    } else {
      // Dia da semana diferente, reinicia a seleção
      setSelectedDayOfWeek(newDayOfWeek);
      setDate([newDate]);
    }
  };

  const isDateDisabledMonthly = (date: Date) => {
    // Desabilita datas passadas
    if (date < new Date()) return true;

    // Se ainda não selecionou nenhum dia, todos estão habilitados
    if (selectedDayOfWeek === -1) return false;

    // Desabilita todos os dias que não sejam do dia da semana selecionado
    return getDay(date) !== selectedDayOfWeek;
  };

  // console.log({ selectedDayOfWeek });

  return (
    <div className="w-full space-y-2">
      {/* DatePicker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className="data-[empty=true]:text-muted-foreground h-12 w-fit justify-start text-left font-normal"
          >
            {mode === "daily" ? (
              <CalendarDays className="mr-2 h-4 w-4" />
            ) : (
              <CalendarSync className="mr-2 h-4 w-4" />
            )}
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full space-y-1 p-1" align="start">
          {mode === "daily" ? (
            <Calendar
              mode="single"
              disabled={(date) => date < new Date()}
              locale={ptBR}
              selected={Array.isArray(date) ? date[0] : date}
              onSelect={handleDailySelect}
              className="rounded-md border"
            />
          ) : (
            <>
              <Calendar
                mode="multiple"
                disabled={isDateDisabledMonthly}
                locale={ptBR}
                selected={Array.isArray(date) ? date : undefined}
                onSelect={handleMonthlySelect}
                className="rounded-md border"
              />

              {mode === "monthly" && (
                <Button
                  className="w-full text-sm"
                  variant="secondary"
                  size={"sm"}
                  disabled={!date || (Array.isArray(date) && date.length === 1)}
                  onClick={() => {
                    setDate([]);
                    setSelectedDayOfWeek(-1);
                  }}
                >
                  Desfazer
                </Button>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>

      {date && (
        <div className="mt-2 space-y-2 rounded-md border p-4">
          <h3 className="font-semibold text-gray-900">Seleção:</h3>
          {mode === "daily" ? (
            <p className="text-sm text-gray-600">
              {Array.isArray(date) && date[0]
                ? format(date[0], "PPP", { locale: ptBR })
                : !Array.isArray(date) && format(date, "PPP", { locale: ptBR })}
            </p>
          ) : (
            <div className="space-y-2">
              {Array.isArray(date) && date.length > 0 && (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Dia da semana: {daysOfWeek[selectedDayOfWeek].label}
                  </p>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1 font-medium">Datas selecionadas:</p>
                    <ul className="list-inside list-disc space-y-1">
                      {date.map((d, idx) => (
                        <li key={idx}>{format(d, "PPP", { locale: ptBR })}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
