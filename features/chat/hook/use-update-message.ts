import { create } from "zustand";
import { persist,PersistOptions  } from "zustand/middleware";
import { BaseMessage } from "@langchain/core/messages";
import { AIMessage,HumanMessage } from "@langchain/core/messages";

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
    WRshort:string,
    WRlong:string,
    setWRshort:(data:string)=>void,
    setWRlong:(data:string)=>void,
    resetMessage:()=>void;
    personaDes:string,
    followUpQ:string[],
    followHistory:BaseMessage[],
    upDateFollowUpH:(data:BaseMessage)=>void,
    setFollowQ:(data:string[])=>void,
    setPersonaDes:(data:string)=>void,
    isloading:boolean;
    setPersonaInfo:(data:string)=>void;
    personaInfo:string;
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

type ChatPersist = Partial<OpenTransactionState>;

const persistConfig: PersistOptions<OpenTransactionState, ChatPersist> = {
    name: "update-chat-storage",
    partialize: (state) => ({
        personaDes: state.personaDes,
        personaInfo:state.personaInfo

    }),
};

export const useUpdateChat = create(persist((set) => ({
    WRshort:"Loading...",
    WRlong:"Loading...",
    personaDes:`hello`,
    followUpQ:[],
    isloading:false,
    followHistory:[],
    setWRlong:(data)=>set({WRlong:data}),
    setWRshort:(data)=>set({WRshort:data}),
    upDateFollowUpH:(message) => set((state) => {
        return{ followHistory: [...state.followHistory,new AIMessage("generate a array of questions surprise me"), message] }}),
    setPersonaDes:(data)=> set({personaDes:data}),
    setFollowQ:(data)=>set({followUpQ:data}),
    setPersonaInfo:(data)=>set({personaInfo:data}),
    setIsLoading:()=>set((state)=>({isloading:!state.isloading})),
    messages: [],
    personaInfo:`{"name":""}`,
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
}),persistConfig));