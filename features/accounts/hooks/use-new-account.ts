import { create } from "zustand";

type newAccountState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewAccount = create<newAccountState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
