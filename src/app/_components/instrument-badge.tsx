import type React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { instrumentOptions, instrumentsIcons } from "@/lib/constants";
import type { Instrument } from "@/lib/types";
import { SetInstrument } from "@/lib/utils/setInstrument";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

type InstrumentProps = {
  instrument: string;
  className?: string;
} & React.ComponentProps<"div"> &
  VariantProps<typeof instrumentBadgeVariants> & {
    tooltip?: boolean;
  };

const instrumentBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1",
  {
    variants: {
      variant: {
        default:
          "[&>span]:bg-accent [&>span]:p-1 [&>span]:rounded-full [&>span]:w-6 [&>span]:h-6 [&>span]:justify-center [&>span]:flex [&>span]:items-center",
        badge: "bg-accent rounded-md p-2 shadow-md",
        hasIcon: "text-muted-foreground items-start justify-start",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const InstrumentBadge = ({
  instrument,
  tooltip = false,
  className,
  variant = "default",
  size = "default",
  ...props
}: InstrumentProps) => {
  const Comp = "div";

  const p = (
    <Comp
      className={cn(instrumentBadgeVariants({ variant, size }), className)}
      {...props}
    >
      <span>{SetInstrument(instrument as Instrument).icon}</span>
      <p>{SetInstrument(instrument as Instrument).label}</p>
    </Comp>
  );

  if (!tooltip) {
    return p;
  }

  return (
    <Tooltip key={instrument}>
      <TooltipTrigger
        className={cn(
          "bg-accent text-m mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md",
          className,
        )}
      >
        {instrumentsIcons[instrument as Instrument]}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        // hidden={state !== "collapsed" || isMobile}
      >
        {instrumentOptions.find((ins) => ins.value === instrument)?.label}
      </TooltipContent>
    </Tooltip>
  );
};
