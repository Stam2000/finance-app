import { create } from "zustand";
import {formatText} from "@/lib/utils"

type user = "AI" | "user";
interface Message {
    sender: user;
    content: string;
}
interface FormData {
    question: string;
    Files: File[];
}

type OpenTransactionState = {
    messages: Message[];
    resetMessage:()=>void;
    isloading:boolean;
    setIsLoading:()=>void;
    updateLastMessage: (content: string) => void;
    updateMessage: (message: Message) => void;
    formData: FormData;
    setFormData: (data: Partial<FormData>) => void;
    reset: () => void;
    removeFile: (name: string) => void;
    threadId:string;
    setThreadId:(threadId:string)=>void
}

export const useUpdateChat = create<OpenTransactionState>((set) => ({
    isloading:false,
    setIsLoading:()=>set((state)=>({isloading:!state.isloading})),
    messages: [],
    
    resetMessage:()=>set({messages:[]}),
    threadId:"",
    formData: { question: "", Files: [] },
    setFormData: (data) => set((state) => ({
        formData: {
            ...state.formData,
            ...data,
            Files: data.Files ? [...data.Files] : state.formData.Files,
        }
    })),
    updateLastMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0 && messages[messages.length - 1].sender === "AI") {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            };
          }
          return { messages };
        }),
    updateMessage: (message) => set((state) => {
        return{ messages: [...state.messages, message] }}),
    reset: () => set({ formData: { question: "", Files: [] } }),
    removeFile: (name) => set((state) => ({
        formData: {
            ...state.formData,
            Files: state.formData.Files.filter(file => file.name !== name)
        }
    })),
    setThreadId:(id)=>set({threadId:id})
}));