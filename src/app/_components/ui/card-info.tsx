import type { LucideIcon } from "lucide-react";

type CardInfoProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const CardInfo = ({ icon: Icon, title, description }: CardInfoProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 text-center shadow-md transition hover:shadow-lg sm:p-6">
      <Icon className="mx-auto mb-3 h-8 w-8 text-teal-600" />
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};
