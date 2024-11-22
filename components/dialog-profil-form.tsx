import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import {PersonaForm} from "./profil-form"
  import { useState } from "react"

  export const DialogProfilForm = ()=>{
    const [generatedData, setGeneratedData] = useState<string>(``)
    return(
        <Dialog  >
        <DialogTrigger>Generate Profile with AI</DialogTrigger>
        <DialogContent className="scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-track-white scrollbar-thumb-slate-300  p-8" >
            <DialogHeader>
{/*             <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
            </DialogDescription> */}
            </DialogHeader>
            <PersonaForm setGeneratedData={(data)=>setGeneratedData(data)} generatedData={generatedData} />
        </DialogContent>
        </Dialog>
    )
  }