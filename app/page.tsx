"use client"

import { PersonaForm } from "@/components/profil-form"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import MarkdownTypewriter from "@/components/markdownTyper"
import { useMedia } from "react-use"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useAnimation } from "framer-motion"
import { useRef } from "react"
import { useUpdateChat } from "@/features/chat/hook/useUpdateMessage"


  interface Persona {
    id:string,
    name:string,
    nationality:string,
    location:string,
    income:string,
    Occupation:string,
    description:string
  }

  const profile = [
    {   
        id:"d",
        name:"Bayebeck Rostand",
        nationality:"cameroon",
        location:"Cameroon",
        Occupation:"Docteur",
        income:"2000",
        description:"Recently started taking online courses for career advancement."
    },
    {
        id:"s",
        name:"Madelene",
        nationality:"France",
        location:"France",
        income:"2000",
        Occupation:"Ingenieur",
        description:"Recently completed a certification in cloud computing."
    },
    {   
        id:"de",
        name:"Mbimdiki jeremi",
        nationality:"Nigeria",
        location:"Nigeria",
        income:"2000",
        Occupation:"Bost",
        description:"Recently completed a certification in cloud computing."
    }
  ]
 
const CardDisplay = ({persona , onSelect,isDisabled }:{isDisabled:boolean,persona:Persona,onSelect:(persona:Persona)=>void})=>{
  const isMobile= useMedia('(max-width: 768px)',false)
 

  const {setPersonaInfo}=useUpdateChat()
  const router = useRouter()
  const handleClick =(persona:Persona)=>{
    setPersonaInfo(JSON.stringify(persona))
    localStorage.setItem('selectedPersona', persona.id)
    router.push("/dashboard")
  }

    if(isMobile){
      return(
        <div className="w-full  pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-around gap-1 mb-4">
            <div className="w-[40%] flex justify-center " >
                <img className="object-cover rounded-xl h-32 "  src={`/ailog.webp`}  alt={"lg.displayName"}/>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center " >
              <span className= "flex text-center  items-center justify-center font-poiret-one font-extrabold text-slate-750  text-2xl mb-2" >
                  {persona.name}
              </span>
              <div className="flex items-center justify-center">
                <Button disabled={isDisabled} className="bg-black" onClick={()=>handleClick(persona)} >Go to Dashboard</Button>
              </div>
            </div>
          </div>
          <div>
          <div className="mb-4" >
                <div  className="w-full grid gap-3 grid-cols-2 rounded-md  bg-gradient-to-r from-black  to-slate-950 to-90% p-3  text-sm" >
                    <div className=" flex-col flex items-center justify-center " >
                      <span className="font-bold text-sm flex  items-center text-white  gap-1" > Nationality 📘:</span>  <span className="text-gray-100 text-sm" >{persona.nationality}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold  text-sm flex items-center text-white gap-1" > Location 🗺️:</span>  <span className="text-gray-100 text-sm" >{persona.location}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold  text-sm flex items-center text-white gap-1" > Occupation 💼:</span>   <span className="text-gray-100 text-sm" >{persona.Occupation}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold text-sm flex items-center text-white gap-1" > Income 💰:</span>   <span className="text-gray-100 text-sm" >{persona.income} 
                      $</span>
                    </div>  
                  </div>
                </div>
          </div>
          <div>
            <div className="flex-col flex gap-2" >
                        <span className="font-bold text-sm " >description:</span>  
                        <span className="text-gray-700 text-sm " >
                          Andere werden nur mit Ihrer Einwilligung gesetzt, z. B. solche, die uns helfen, test.de für Sie zu optimieren. Nähere Informationen über Cookies auf test.de erhalten Sie unter „Details auswählen“ und in unseren Datenschutzhinweisen.
                        </span>
                  </div>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>More Information</AccordionTrigger>
                          <AccordionContent>
                          Wir respektieren Ihre Privatsphäre
                          Wir nehmen den Schutz Ihrer Daten sehr ernst und möchten gleichzeitig, dass Sie bei uns die Angebote finden, die zu Ihnen passen. Dazu setzen wir verschiedene Cookies und Technologien ein. Einige dieser Cookies sind für den Betrieb unserer Website notwendig. Andere werden nur mit Ihrer Einwilligung gesetzt, z. B. solche, die uns helfen, test.de für Sie zu optimieren. Nähere Informationen über Cookies auf test.de erhalten Sie unter „Details auswählen“ und in unseren Datenschutzhinweisen.
                          </AccordionContent>
                    </AccordionItem>
                  </Accordion>
            </div>
        </div>
    </div>
      )
    }

    return(
      <div className="w-full overflow-hidden pb-6">
        <div >
        <div className="flex gap-1 items-start justify-center " >
            <div className="w-2/5 flex flex-col gap-2 items-center justify-between h-[50%]" >
                <img className="object-cover rounded-xl h-40 "  src={`/ailog.webp`}  alt={"lg.displayName"}/>
                <div className="flex items-center justify-center">
                  <Button disabled={isDisabled} className="bg-black" onClick={()=>handleClick(persona)} >Go to Dashboard</Button>
                </div>
            </div>
            <div className="w-full flex flex-col  gap-3 text-md">
                <div className="font-poiret-one font-extrabold text-slate-750  text-3xl mb-2" >
                  {persona.name}
                </div>
                <div>
                    <div  className="w-full grid  lg:grid-cols-4 rounded-md  bg-gradient-to-r from-black  to-slate-950 to-90% p-2 gap-2 text-md" >
                    <div className=" flex-col flex items-center justify-center " >
                      <span className="font-bold text-md flex  items-center text-white  gap-1" > Nationality 📘:</span>  <span className="text-gray-200 text-md " >{persona.nationality}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold  text-md flex items-center text-white gap-1" > Location 🗺️:</span>  <span className="text-gray-200 text-md " >{persona.location}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold  text-md flex items-center text-white gap-1" > Occupation 💼:</span>   <span className="text-gray-200 text-md " >{persona.Occupation}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold text-md flex items-center text-white gap-1" > Income 💰:</span>   <span className="text-gray-200 text-md " >{persona.income} 
                      $</span>
                    </div>  
                  </div>
                </div>
                <div className="flex-col flex gap-2" >
                      <span className="font-bold text-md " >description:</span>  
                      <span className="text-gray-700 text-sm " >
                        Andere werden nur mit Ihrer Einwilligung gesetzt, z. B. solche, die uns helfen, test.de für Sie zu optimieren. Nähere Informationen über Cookies auf test.de erhalten Sie unter „Details auswählen“ und in unseren Datenschutzhinweisen.
                      </span>
                </div>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>More Information</AccordionTrigger>
                        <AccordionContent>
                        Wir respektieren Ihre Privatsphäre
                        Wir nehmen den Schutz Ihrer Daten sehr ernst und möchten gleichzeitig, dass Sie bei uns die Angebote finden, die zu Ihnen passen. Dazu setzen wir verschiedene Cookies und Technologien ein. Einige dieser Cookies sind für den Betrieb unserer Website notwendig. Andere werden nur mit Ihrer Einwilligung gesetzt, z. B. solche, die uns helfen, test.de für Sie zu optimieren. Nähere Informationen über Cookies auf test.de erhalten Sie unter „Details auswählen“ und in unseren Datenschutzhinweisen.
                        </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div> 
        </div>
      </div>
    </div>
    )
}

const parentVariantRight = {
  hidden: {
    y: -300,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
      type: "spring",
      stiffness: 230,
      damping: 40
    }
  }
}
const parentVariantLeft={
  hidden:{x:-1000},
  visible:{x:0},
  firstVisible:{y:0,opacity:1,
    transition:{
      y: { type: "spring", stiffness: 230, damping: 40 }, // Specific for x
      duration:0.1,
    }
  },
  firstLoad:{y:-300,opacity:0},
  exit:{x:-1000}}


const Page = ()=>{
    const [generatedData, setGeneratedData] = useState<string>(``)
    const router = useRouter();
    const isMobile= useMedia('(max-width: 768px)',false)
    const [openForm,setOpenForm]=useState<boolean>(false)
    const [isDisabled,setIsDisabled]=useState<boolean>(false)
    const isFirstRender = useRef(true);
    const {personaDes,personaInfo,setPersonaDes,setPersonaInfo}=useUpdateChat()
    useEffect(() => {

      setPersonaDes(generatedData);

    
  }, [setPersonaDes,generatedData]);

  
    
    useEffect(() => {

      setTimeout(() => {
        if (isFirstRender.current) {
        console.log("Page loaded for the first time");
        isFirstRender.current = false; // Mark as no longer the first render
      }
      }, 5);
      
    }, []);
  

    const selectPersona = (persona:Persona) => {
        console.log(persona)
        // Store the selected persona in localStorage
        localStorage.setItem('selectedPersona', persona.id);
        // Redirect to dashboard
        console.log(localStorage.getItem('selectedPersona'))
        router.push('/transactions');
      };

    if(isMobile){


      const parentVariantRight={
        hidden:{x:30},
        visible:{x:0,
          transition:{
            delayChildren: 0.2,
            duration:0.2,
            staggerChildren: 0.2,
          }
        }
      }
      const parentVariantLeft={
        hidden:{x:-30},
        firstLoad:{y:-10,opacity:0},
        firstVisible:{y:0,opacity:1,transition:{
          delayChildren: 0.2,
          duration:0.3,
        }},
        visible:{x:0,
          transition:{
            delayChildren: 0.5,
            duration:0.2,
            staggerChildren: 0.2,
          }
        }
      }

      const childrenLeft ={
        firstLoad:{y:-5,opacity:0},
        firstVisible:{y:0,opacity:1,transition:{
          duration:0.2,
        }},
      }

      const childrenVariants={
        hidden:{y:-10,opacity:0},
        visible:{y:0,opacity:1}
      }

      

      return(
        <div className="flex h-lvh overflow-y-auto">
          {
            openForm ? (
              <motion.div
              key={"form"}
              variants={parentVariantRight}
              initial="hidden"
              animate="visible"
              className="relative w-full h-lvh p-4 flex flex-col items-center justify-center bg-[length:900px_900px] bg-repeat"
              style={{ backgroundImage: "url('/pattern.png')" }}
            >
              
              <motion.div variants={childrenVariants} className="self-start ml-2 mb-2" >
                <Button disabled={isDisabled} onClick={()=>setOpenForm(prev => !prev)} >
                  Go Back
                </Button>
              </motion.div>
                <motion.div variants={childrenVariants} className=" h-[90%] mb-3" >
                    <PersonaForm  onDisable={()=>setIsDisabled(prev => !prev)} setGeneratedData={(data)=>setGeneratedData(data)} generatedData={generatedData} />
                </motion.div>
                {generatedData && 
                    <motion.div initial={{height:0}} animate={{height:"100%"}}  transition={{duration:0.8}} className="bg-slate-50 mx-6 border-[1px] w-full text-md border-slate-500 h-full rounded-md font-light overflow-y-auto">
                    <MarkdownTypewriter
                      content={generatedData}
                      typeSpeed={30}
                      cursor={{
                        shape: 'block',
                        color: 'bg-blue-500'
                      }}
                    />
                  </motion.div>
              }
            </motion.div>):(
                <motion.div key={"list"} initial={isFirstRender.current ? "firstLoad" : "hidden"} variants={parentVariantLeft}
                  animate={isFirstRender.current ? "firstVisible" : "visible"} className="w-full h-full p-10 flex flex-col gap-4 " >
                  <span>
                    <img className="object-cover rounded-xl h-10 "  src={`/ailog.webp`}  alt={"lg.displayName"}/>
                  </span>
                  <div className="">
                    <div className="text-sm" >
                        Andere werden nur mit Ihrer Einwilligung gesetzt, z. B. solche, die uns helfen, test.de für Sie zu optimieren. Nähere Informationen über Cookies auf test.
                    </div>
                    <div className="flex items-center justify-center my-6" >
                      <button onClick={()=>setOpenForm(prev => !prev)} className=" w-full bg-slate-950 text-white text-md rounded-lg p-2" >
                        <div className="flex flex-col" >
                          <span className="font-bold text-sm" >
                            Custom Profile
                          </span>
                          <span className="text-sm font-extralight" >
                            (powerded by AI)
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                    <motion.div variants={childrenLeft} className=" scrollbar-none" >
                        {(profile.map((p,index)=> <CardDisplay isDisabled={isDisabled} key={index} persona={p} onSelect={selectPersona} /> ))}
                    </motion.div> 
                </motion.div>
              )
          }

        
    </div>
      )
    }

    return(
        <div className="flex h-lvh overflow-y-hidden">
            <div className="w-[55%] h-full p-10 flex flex-col gap-4 justify-center " >
              <div className="my-4 " >
                  <img className="object-cover rounded-xl h-10 "  src={`/ailog.webp`}  alt={"lg.displayName"}/>
              </div>
              
                <div className="overflow-y-auto flex-1 scrollbar-none" >
                  {generatedData ? <motion.div key={"MarkdownTypewriter"}   transition={{x: { type: "spring", stiffness: 350, damping: 40 }}} initial={{x:-1000}} animate={{x:0}} className="bg-slate-50 border-[1px] border-slate-500 h-full rounded-md font-light overflow-y-auto">
                  <MarkdownTypewriter
                    content={generatedData}
                    typeSpeed={30}
                    cursor={{
                      shape: 'block',
                      color: 'bg-blue-500'
                    }}
                  />
                    {/* <MarkdownTypewriter content={generatedData} /> */}
                </motion.div> :
                <motion.div initial={isFirstRender.current ? "firstLoad" : "hidden"} variants={parentVariantLeft}
                animate={isFirstRender.current ? "firstVisible" : "visible"} exit="exit"  key={"personaList"} className="overflow-y-auto scrollbar-none" >
                    {(profile.map((p,index)=> <CardDisplay isDisabled={isDisabled} key={index} persona={p} onSelect={selectPersona} /> ))}
                </motion.div>
                 }
                </div>

            </div>
            <div
              className="relative w-[45%] flex items-center justify-center bg-[length:900px_900px] bg-repeat"
              style={{ backgroundImage: "url('/pattern.png')" }}
            >
                <motion.div initial="hidden" animate="visible" variants={parentVariantRight} className=" h-[90%] p-4" >
                    <PersonaForm onDisable={()=>setIsDisabled(prev => !prev)} setGeneratedData={(data)=>setGeneratedData(data)} generatedData={generatedData} />
                </motion.div>
            </div>
        </div>
    )
}

export default Page