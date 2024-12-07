import { create } from "zustand";
import { BaseMessage } from "@langchain/core/messages";

type OpenTransactionState = {
    personaDes: string;
    followUpQ: string[];
    followHistory: BaseMessage[];
    upDateFollowUpH: (data: BaseMessage) => void;
    setFollowQ: (data: string[]) => void;
    setPersonaDes: (data: string) => void;
    setPersonaInfo: (data: string) => void;
    personaInfo: string;
};

export const useUpdatePersona = create<OpenTransactionState>((set) => ({
    personaDes: "",
    followUpQ: [],
    followHistory: [],
    upDateFollowUpH: (message) =>
        set((state) => ({
            followHistory: [...state.followHistory, message],
        })),
    setPersonaDes: (data) => set({ personaDes: data }),
    setFollowQ: (data) => set({ followUpQ: data }),
    setPersonaInfo: (data) => set({ personaInfo: data }),
    personaInfo: "",
}));
