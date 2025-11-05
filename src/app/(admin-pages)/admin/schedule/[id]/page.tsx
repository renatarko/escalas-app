import ScheduleForm from "@/app/_components/schedule-form";

type EditScheduleParams = {
  params: Promise<{ id: string }>;
};

export default async function EditSchedule({ params }: EditScheduleParams) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{id}Editar Escala</h2>
      <ScheduleForm />
    </div>
  );
}
