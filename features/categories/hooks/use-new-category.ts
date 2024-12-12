import { create } from "zustand";

type newCategoryState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewCategory = create<newCategoryState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
