import { cn } from "@/lib/utils";

type SectionHeaderProps = Readonly<{
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
}>;

export function SectionHeader({
  title,
  highlight,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-16 text-center", className)}>
      <h2 className="mb-4 text-2xl font-bold sm:text-5xl">
        {title}{" "}
        {highlight && (
          <span className="from-primary to-primary/80 text-card-foreground/50 bg-linear-to-r bg-clip-text">
            {highlight}
          </span>
        )}
      </h2>

      {description && (
        <p className="text-muted-foreground mx-auto max-w-2xl sm:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}
