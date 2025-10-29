import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
  mode?: "daily" | "monthly";
  className?: string;
}

export function DatePickerCustom({
  mode,
  date,
  setDate,
  className,
}: DatePickerProps) {
  const handleDailySelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* DatePicker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className={cn(
              `data-[empty=true]:text-muted-foreground h-14 w-fit justify-start text-left font-normal`,
              className,
            )}
          >
            <CalendarIcon className="size-4" />
            {date ? format(date, "P", { locale: ptBR }) : "Selecione uma data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full space-y-1 p-1" align="start">
          <Calendar
            mode="single"
            disabled={(date) => date < new Date()}
            locale={ptBR}
            selected={date}
            onSelect={handleDailySelect}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
