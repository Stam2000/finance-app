import { create } from "zustand";

type NewTransactionState = {
  transactionId?: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useNewDetails = create<NewTransactionState>((set) => ({
  transactionId: undefined,
  isOpen: false,
  onOpen: (transactionId) => set({ isOpen: true, transactionId }),
  onClose: () => set({ isOpen: false, transactionId: undefined }),
}));
