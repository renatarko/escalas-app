"use client";

import ScheduleForm from "@/app/_components/schedule-form";

type EditScheduleParams = {
  params: {
    id: string;
  };
};

export default function EditSchedule({ params }: EditScheduleParams) {
  const { id } = params;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Editar Escala</h2>
      <ScheduleForm />
    </div>
  );
}
