import { create } from "zustand";

type newProjectState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewProject = create<newProjectState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
