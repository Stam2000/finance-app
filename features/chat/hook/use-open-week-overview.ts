import { create } from "zustand";

type WeekOverviewState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useOpenWeeKOverview = create<WeekOverviewState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
