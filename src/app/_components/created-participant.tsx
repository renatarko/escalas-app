import { Send, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  instrumentOptions,
  instrumentsIcons,
  WHATSAPP_BASE_URL,
} from "@/lib/constants";
import type { Instrument } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type ParticipantProps = {
  id: string;
  name: string;
  whatsapp: string;
  functions: string[];
};

export const CreatedParticipant = ({
  id,
  name,
  whatsapp,
  functions,
}: ParticipantProps) => {
  return (
    <div
      key={id}
      className="flex justify-between rounded-lg border p-4 transition-shadow hover:shadow-md sm:items-center"
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="space-y-1">
          <h4 className="font-semibold">{name}</h4>
          <a
            href={`${WHATSAPP_BASE_URL}/55${whatsapp}`}
            target="_blank"
            className="text-muted-foreground flex items-center gap-1 text-sm hover:underline"
          >
            <Send className="size-4 text-green-600" /> {whatsapp}
          </a>
        </div>

        {functions.length > 0 && (
          <ul className="flex list-none items-center gap-2">
            {functions.map((func) => (
              <Tooltip key={func}>
                <TooltipTrigger className="bg-accent mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md">
                  {instrumentsIcons[func as Instrument]}
                </TooltipTrigger>
                <TooltipContent>
                  {
                    instrumentOptions.find(
                      (instrument) => instrument.value === func,
                    )?.label
                  }
                </TooltipContent>
              </Tooltip>
            ))}
          </ul>
        )}
      </div>

      <Button size="icon-sm" variant="destructive">
        <Trash />
      </Button>
    </div>
  );
};
