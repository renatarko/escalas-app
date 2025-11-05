import { EditSchedule } from "@/app/_components/edit-schedule";
import Link from "next/link";

type EditScheduleParams = {
  params: Promise<{ id: string }>;
};

export default async function EditSchedulePage({ params }: EditScheduleParams) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin`}
        className="text-primary w-fit text-sm hover:underline"
      >
        Voltar
      </Link>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Editar Escala</h2>
        <EditSchedule id={id} />
      </div>
    </div>
  );
}
