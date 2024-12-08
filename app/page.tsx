"use client"

import { PersonaForm } from "@/components/profil-form"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import MarkdownTypewriter from "@/components/markdown-typer"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { MoveRight } from "lucide-react"
import { useRef } from "react"
import {useMediaQuery} from "react-responsive"
import { useUpdateChat } from "@/features/chat/hook/use-update-message"
import { persona1D,persona2D,persona3D,persona4D } from "@/lib/personaDescr"
import { Separator } from "@/components/ui/separator"


  interface Persona  {
    id: string; // A unique identifier for the profile
    name: string; // Full name of the individual
    age: number; // Age of the individual
    occupation: string; // Occupation or job title
    familyStatus: string; // Marital or family status
    countryOfResidence: string; // Country where the individual resides
    nationality: string; // Nationality of the individual
    monthlyIncome: string; // Monthly income as a string (e.g., "4200$")
    locationType: string; // Type of location (e.g., urban, suburban, rural)
    spendingBehavior: string; // Spending habits (e.g., frugal, balanced)
    additionalInfo: string; // Extra information about the individual
    monthlyRent: number; // Monthly rent in numerical form
    monthlySavings: number; // Monthly savings in numerical form
    riskTolerance: string; // Risk tolerance for investments or finances
    creditCards: string; // Credit card usage level or behavior
    workSchedule: string; // Work schedule (e.g., regular, irregular)
    transportation: string; // Primary mode of transportation
    diningPreference: string; // Dining preferences (e.g., homemade, eating out)
    shoppingHabits: string; // Shopping habits (e.g., impulsive, planner)
    description: string;
    image:string;
    fullDesc:string
  }

  const profile = [
    {
      id:"profile1",
      name: "Hans Schmidt",
      age: 35,
      occupation: "Mechanical Engineer",
      familyStatus: "married",
      countryOfResidence: "Germany",
      nationality: "German",
      monthlyIncome: `4200`,
      locationType: "suburban",
      spendingBehavior: "balanced",
      additionalInfo: "Avid traveler",
      monthlyRent: 1200,
      monthlySavings: 1000,
      riskTolerance: "moderate",
      creditCards: "moderate",
      workSchedule: "regular",
      transportation: "car",
      diningPreference: "mixed",
      shoppingHabits: "planner",
      description:"Hans Schmidt, 35, is a married Mechanical Engineer living in Munich’s suburbs. Combining German precision with a global outlook, he specializes in sustainable automotive systems. Fluent in German and English, Hans values family, work-life balance, and cultural diversity. Passionate about hiking, soccer, and travel, he aspires to leadership and personal fulfillment.",
      image:"hans",
      fullDesc:persona1D
    },{
      id:"profile2",
      name: "Isabella Rossi",
      age: 38,
      occupation: "Interior Designer",
      familyStatus: "single",
      countryOfResidence: "Italy",
      nationality: "Italian",
      monthlyIncome: "3800",
      locationType: "urban",
      spendingBehavior: "balanced",
      additionalInfo: "Frequent traveler for work",
      monthlyRent: 1300,
      monthlySavings: 500,
      riskTolerance: "moderate",
      creditCards: "frequent",
      workSchedule: "flexible",
      transportation: "mixed",
      diningPreference: "eatOut",
      shoppingHabits: "impulsive",
      description:"Isabella Rossi, a 38-year-old single Interior Designer in Milan, blends Italian elegance with modern creativity. Educated at Politecnico di Milano and Domus Academy, she excels in sustainable, high-profile projects. Fluent in Italian and English, Isabella travels frequently for work, values cultural experiences, and aspires to establish her own renowned design studio.",
      image:"isabella",
      fullDesc:persona2D
    },{
      id:"profile3",
      name: "Jean-Pierre Ebogo",
      age: 37,
      occupation: "IT Consultant",
      familyStatus: "married_with_children",
      countryOfResidence: "Germany",
      nationality: "Cameroonian",
      monthlyIncome: "4800",
      locationType: "suburban",
      spendingBehavior: "frugal",
      additionalInfo: "Saving for children's education and family vacations",
      monthlyRent: 1100,
      monthlySavings: 1200,
      riskTolerance: "conservative",
      creditCards: "rarely",
      workSchedule: "flexible",
      transportation: "car",
      diningPreference: "homeCook",
      shoppingHabits: "planner",
      description:"Jean-Pierre Ebogo, 37, is a married IT Consultant from Cameroon living in Frankfurt’s suburbs with two children. Dedicated to his family, he prioritizes saving for education and vacations through frugal spending and careful planning. Fluent in French, English, and German, he values cultural diversity, community, and a balanced work-life.",
      image:"ebogo",
      fullDesc:persona3D
    },{
      id:"profile",
      name: "Yumi Nakamura",
      age: 30,
      occupation: "Chef",
      familyStatus: "single",
      countryOfResidence: "Japan",
      nationality: "Japanese",
      monthlyIncome: "3500",
      locationType: "urban",
      spendingBehavior: "balanced",
      additionalInfo: "Opening a new restaurant next year",
      monthlyRent: 1200,
      monthlySavings: 800,
      riskTolerance: "aggressive",
      creditCards: "moderate",
      workSchedule: "shift",
      transportation: "mixed",
      diningPreference: "mixed",
      shoppingHabits: "impulsive",
      description:"Yumi Nakamura, a 30-year-old single chef in Tokyo, blends traditional Japanese values with modern innovation. Educated at Tsuji Culinary Institute, she excels in fusion cuisine and aims to open her own restaurant. Fluent in Japanese and English, Yumi values sustainability, creativity, and work-life balance while navigating Tokyo’s competitive culinary scene.",
      image:"yumi",
      fullDesc:persona4D
    }
  ]
 
const CardDisplay = ({persona , isDisabled }:{isDisabled:boolean,persona:Persona})=>{
  const isMobile= useMediaQuery({maxWidth:768})
  const {setPersonaDes}=useUpdateChat()
 

  const {setPersonaInfo}=useUpdateChat()
  const router = useRouter()

  const handleClick =(persona:Persona)=>{
    setPersonaInfo(JSON.stringify(persona))
    setPersonaDes(persona.fullDesc)
    localStorage.setItem('selectedPersona', persona.id)
    router.push("/dashboard")
  }

    if(isMobile){
      return(
        <div className="w-full  mb-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-around gap-1 mb-4">
            <div className="w-[40%] flex justify-center " >
                <img className="object-cover rounded-xl h-32 "  src={`/${persona.image}.jpg`}  alt={"lg.displayName"}/>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center " >
              <span className= "flex text-center  items-center justify-center font-poiret-one font-extrabold text-slate-750  text-2xl mb-2" >
                  {persona.name}
              </span>
              <div className="flex items-center justify-center">
                <Button disabled={isDisabled} className="bg-black" onClick={()=>handleClick(persona)} >Go to Dashboard <MoveRight className="ml-2" size={16} /> </Button>
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
                      <span className="font-bold  text-sm flex items-center text-white gap-1" > Location 🗺️:</span>  <span className="text-gray-100 text-sm" >{persona.countryOfResidence}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold  text-sm flex items-center text-white gap-1" > Occupation 💼:</span>   <span className="text-gray-100 text-sm" >{persona.occupation}</span>
                    </div>
                    <div className="flex-col flex items-center justify-center" >
                      <span className="font-bold text-sm flex items-center text-white gap-1" > Income 💰:</span>   <span className="text-gray-100 text-sm" >{persona.monthlyIncome} 
                      $</span>
                    </div>  
                  </div>
                </div>
          </div>
          <div>
            <div className="flex-col flex gap-2" >
                        <span className="font-bold text-sm " >description:</span>  
                        <span className="text-gray-700 text-sm " >
                          {persona.description}
                        </span>
                  </div>
            </div>
        </div>
    </div>
      )
    }

    return(
      <div className="w-full overflow-hidden mb-20">
        <div >
        <div className="flex gap-1 items-start justify-center " >
            <div className="w-2/5 flex flex-col gap-2 items-center justify-between h-[50%]" >
                <img className="object-cover rounded-xl h-40 "  src={`/${persona.image}.jpg`}  alt={"lg.displayName"}/>
                <div className="flex items-center justify-center">
                  <Button disabled={isDisabled} className="bg-black" onClick={()=>handleClick(persona)} >Go to Dashboard <MoveRight className="ml-2" size={16} /> </Button>
                </div>
            </div>
            <div className="w-full flex flex-col  gap-3 text-md">
                <div className="font-poiret-one font-extrabold text-slate-750  text-3xl mb-2" >
                  {persona.name}
                </div>
                <div>
                    <div  className="w-full grid  lg:grid-cols-4 rounded-md  bg-gradient-to-r from-black  to-slate-950 to-90% p-2 gap-2 text-md" >
                    <div className=" flex-col flex items-center  " >
                      <span className="font-bold text-md flex  items-center text-white  gap-1" > Nationality 📘:</span>  <span className="text-gray-200 text-md flex items-center justify-center h-full " >{persona.nationality}</span>
                    </div>
                    <div className="flex-col flex items-center" >
                      <span className="font-bold  text-md flex items-center justify-self-start  text-white gap-1" > Location 🗺️:</span>  <span className="text-gray-200 text-md flex items-center justify-center h-full " >{persona.countryOfResidence}</span>
                    </div>
                    <div className="flex-col flex items-center " >
                      <span className="font-bold  text-md flex items-center text-white gap-1" > Occupation 💼:</span>   <span className="text-gray-200 text-md text-center flex items-center justify-center h-full " >{persona.occupation}</span>
                    </div>
                    <div className="flex-col flex items-center " >
                      <span className="font-bold text-md flex items-center text-white gap-1" > Income 💰:</span>   <span className="text-gray-200 text-md flex items-center justify-center h-full " >{persona.monthlyIncome} 
                      $</span>
                    </div>  
                  </div>
                </div>
                <div className="flex-col flex gap-2" >
                      <span className="font-bold text-md " >description:</span>  
                      <span className="text-gray-700 text-sm " >
                        {persona.description}
                      </span>
                </div>
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
    const isMobile= useMediaQuery({maxWidth:768})
    const [openForm,setOpenForm]=useState<boolean>(false)
    const [isDisabled,setIsDisabled]=useState<boolean>(false)
    const isFirstRender = useRef(true);
    const {setPersonaDes}=useUpdateChat()
    useEffect(() => {

      setPersonaDes(generatedData);

    
  }, [setPersonaDes,generatedData]);

  
    
    useEffect(() => {

      setTimeout(() => {
        if (isFirstRender.current) {
        isFirstRender.current = false; // Mark as no longer the first render
      }
      }, 5);
      
    }, []);
  

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
                        {(profile.map((p,index)=> <CardDisplay isDisabled={isDisabled} key={index} persona={p} /> ))}
                    </motion.div> 
                </motion.div>
              )
          }

        
    </div>
      )
    }

    return(
        <div className="flex h-lvh overflow-y-hidden">
            <div className="w-[55%] h-full pt-0 p-10 flex flex-col gap-4 justify-center " >
              <div className="" >
                  <div className="flex items-center mt-4 gap-2 " >
                    <span className="" >
                      <img className="object-cover rounded-xl h-10 "  src={`/ailog.webp`}  alt={"lg.displayName"}/>
                    </span>
                    <h1 className="flex-1  p-4 rounded-xl text-center font-poiret-one text-[38px] font-bold  bg-gradient-to-r from-slate-800 from-0% via-blue-700 via-25% to-blue-950 to-100% text-transparent bg-clip-text" > Welcome to <span className="underline decoration-blue-800 underline-offset-8 decoration-4" >Fimae</span>, your personal ai finance assistant! </h1>
                  </div>
                  <div className="whitespace-pre-line mb-6 flex flex-col gap-2 leading-relaxed" >
                    {/* <p className="self-center  text-slate-800 font-oxygen italic text-sm " >Get started:</p> */}
                    <p  className="flex gap-2 my-8" >
                      <span className="flex-1 text-[17px] text-slate-600 text-center  font-oxygen ">Selecting a ready-made profile to experience how FImae can support your financial decisions.</span>
                      <span className=" w-14 flex items-center font-oxygen  text-sm justify-center" ><Separator className="mr-2" orientation="vertical" />Oder<Separator className="ml-2" orientation="vertical" /></span>
                      <span className="flex-1 text-[17px] text-center font-oxygen text-slate-600 " >Creating a custom profile tailored to your needs or use AI to generate a profile for you</span>
                    </p>
                  </div>
              </div>
              
                <div className="overflow-y-auto  flex-1 scrollbar-none" >
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
                    {(profile.map((p,index)=> <CardDisplay isDisabled={isDisabled} key={index} persona={p} /> ))}
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