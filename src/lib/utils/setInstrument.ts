import { instrumentOptions, instrumentsIcons } from "../constants";
import type { Instrument } from "../types";

export function SetInstrument(instrument: Instrument) {
  return {
    icon: instrumentsIcons[instrument],
    label: instrumentOptions.find((ins) => ins.value === instrument)?.label,
  };
}
