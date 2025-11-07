import { create } from "zustand";

export type TabsStoreProps =
  | "scales"
  | "create-scales"
  | "participants"
  | "invitations";

interface Tabs {
  tab: TabsStoreProps;
  setTab: (tab: TabsStoreProps) => void;
}

export const useTabsStore = create<Tabs>((set) => ({
  tab: "scales",
  setTab: (tab: TabsStoreProps) => set(() => ({ tab })),
}));
