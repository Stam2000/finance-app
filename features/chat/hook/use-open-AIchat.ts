import { create } from "zustand";

type OpenTransactionState = {
  chatOpen: boolean;
  toggleChatOpen: () => void;
};

export const useOpenChat = create<OpenTransactionState>((set) => ({
  chatOpen: false,
  toggleChatOpen: () => set((state) => ({ chatOpen: !state.chatOpen })),
}));
