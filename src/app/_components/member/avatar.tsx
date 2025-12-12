import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import { InstrumentBadge } from "../instrument-badge";

type AvatarProps = Readonly<{
  member: Member;
  size?: "sm" | "default" | "lg";
  showName?: boolean;
  className?: string;
}>;

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  default: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-rose-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({
  member,
  size = "default",
  showName = false,
  className,
}: AvatarProps) {
  const initials = getInitials(member.name);
  const gradientColor = getColorFromName(member.name);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-linear-to-br font-semibold text-white shadow-lg",
          sizeClasses[size],
          gradientColor,
        )}
      >
        {initials}
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-foreground font-medium">{member.name}</span>
          {member.instrument && (
            <InstrumentBadge
              variant="hasIcon"
              size="sm"
              instrument={member.instrument}
            />
          )}
        </div>
      )}
    </div>
  );
}
