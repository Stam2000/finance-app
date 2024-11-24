"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent,CardFooter, CardDescription } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea component
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { useGenPersona } from '@/features/chat/api/use-gen-persona';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  
} from '@/components/ui/form';
import { useGenerateData } from '@/features/chat/api/use-gen-transactions';
import { LoaderPinwheel } from 'lucide-react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUpdateChat } from '@/features/chat/hook/useUpdateMessage';

// Define the form schema using Zod
const formSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50),
    age: z
      .number({
        required_error: 'Age is required',
      })
      .min(18, { message: 'Age must be at least 18' })
      .max(100, { message: 'Age must be at most 100' }),
    occupation: z
      .string()
      .min(2, { message: 'Occupation must be at least 2 characters' })
      .max(50),
    familyStatus: z.enum(['single', 'married', 'married_with_children'], {
      required_error: 'Family Status is required',
    }),
    countryOfResidence:z.string().optional(),
    nationality:z.string().optional(),
    incomeLevel: z.number().min(0).optional(),
    locationType: z.enum(['urban', 'suburban', 'rural']).optional(),
    spendingBehavior: z.enum(['frugal', 'balanced', 'spendthrift']).optional(),
    additionalInfo: z.string().optional(), // Added field to schema
    monthlyRent: z.number().min(0).optional(),
    monthlySavings: z.number().min(0).optional(),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
    creditCards: z.enum(['rarely', 'moderate', 'frequent']).optional(),
    workSchedule: z.enum(['regular', 'shift', 'flexible']).optional(),
    transportation: z.enum(['car', 'public', 'mixed']).optional(),
    diningPreference: z.enum(['homeCook', 'mixed', 'eatOut']).optional(),
    shoppingHabits: z.enum(['planner', 'mixed', 'impulsive']).optional(),
  })

  type ProgressData = {
    step: string;
    message: string;
    status:string,
    progress?: number;
    data?: any;
    transaction?: any;
    processedTransactions?: any[];
    error?: any;
  };

  type Form = z.infer<typeof formSchema>



export const PersonaForm = ({setGeneratedData,onDisable}:{onDisable?:()=>void,setGeneratedData?:(data:string)=>void,generatedData:string}) => {
  const router = useRouter()
  const generateData = useGenerateData()
  const {setPersonaInfo} = useUpdateChat()


 

  const [steps,setSteps] = useState([
  {
    step:"extendPersona",
    message:"",
    status:"extending"
  },
  {
    step:"fiDataGeneration",
    message:"",
    status:"pending"
  },
  {
    step:"updatingFiData",
    message:"",
    status:"pending"
  },
  {
    step:"complete",
    message:"",
    status:"pending"
  }
])
  const [isExecuting,setisExecuting]=useState(false)
  const [progress, setProgress] = useState<ProgressData>()
  const [personaId, setPersonaId] = useState<string>()

console.log(progress)
    const mutationPersona = useGenPersona();
    const {
      mutate: fetchPersonaData,
      data: personaData,
      isPending: personaLoading,
      isError: personaError,
      error: mutationError,
    } = mutationPersona;

  // Initialize useForm with initial defaultValues
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: 18,
      occupation: '',
      familyStatus: 'single',
      incomeLevel: 0,
      locationType: 'urban',
      spendingBehavior: 'balanced',
      additionalInfo: '',
      countryOfResidence:'',
      nationality:'', // Added default value
      monthlyRent: 0,
      monthlySavings: 0,
      riskTolerance: 'moderate',
      creditCards: 'moderate',
      workSchedule: 'regular',
      transportation: 'car',
      diningPreference: 'homeCook',
      shoppingHabits: 'planner',
    },
  });

  // State to handle loading and error states
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // Function to handle AI generation and updating form values
 const handleGenerateWithAi = () => {
    fetchPersonaData()
  };

  useEffect(() => {
    if (personaData) {
      form.reset(personaData);
     
    }
  }, [personaData]);

  // Function to handle form submission
  const handleSubmit =  (data: any) => {

    console.log("submitingstarted")
    setPersonaInfo(JSON.stringify(data))

    generateData.mutate({
      ...data,
      onProgress: (event) => {

        setSteps((prevItems) => 
          prevItems.map((step) => 
            step.step === event.step 
              ? { ...step, message: event.message, status: event.status } 
              : step
          )
        );

        setProgress(event)
      },
      onGeneratedData: setGeneratedData ?  (data) => {

        setGeneratedData(data)
      } : undefined ,
      onGeneratedPersonaId: (personaId) => {

        setPersonaId(personaId)
      },
      onExecution:()=>{setisExecuting(prev=>!prev)},
      onStarted:()=>{ if(onDisable) onDisable()}
    })
    
    
  };

  useEffect(()=>{
    localStorage.setItem('selectedPersona', personaId ? personaId : "testData" )},
  [personaId])

  return (
    <Card className="w-full scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-track-white scrollbar-thumb-border h-full shadow-none border-[1px]  overflow-y-auto  flex flex-col  max-w-2xl  mx-auto">

      <CardHeader className="flex justify-between items-center gap-2">
        <CardTitle className="font-poiret-one text-5xl mb-4 text-slate-800 ">Profile Creator</CardTitle>
        <CardDescription  >Fill out the form to create your unique persona… or let the AI work its magic and surprise you! ✨</CardDescription>
        {!progress && <Button onClick={handleGenerateWithAi} disabled={personaLoading}>
          {personaLoading ? 'Generating...' : 'Generate with AI'}
        </Button>}
      </CardHeader>
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      <CardContent className='flex-1 flex flex-col  gap-14 text-md items-center justify-center' >
        {
          progress ? (
            <div className='flex flex-col' >
              {
                steps.map((step,index)=>{
                  
                  if(step.status === "pending") return undefined
                
                  return(
                    <div key={index} className='flex items-center justify-center gap-2' >
                      <span className='text-slate-600' >{step.message}</span>
                      <span>
                        {step.status === "running" && <LoaderPinwheel className='animate-spin' /> }
                        {step.status ==="completed" && <Check/> }
                      </span>
                    </div>
                  )
                })
              }
            </div>
          ) : 

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Name (Required) */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      Name <span className="text-red-500">* 🖋️</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-blue-900 font-medium" placeholder="Enter name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Age (Required) */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      Age <span className="text-red-500">* 🎂</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="text-blue-900 font-medium"
                        placeholder="Age"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Occupation (Required) */}
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      Occupation <span className="text-red-500">* 💼</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-blue-900 font-medium" placeholder="Enter occupation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Location (Required) */}
              <FormField
                control={form.control}
                name="countryOfResidence"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      Location <span className="text-red-500">* 🗺️</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-blue-900 font-medium" placeholder="Enter location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />{/* Location (Required) */}
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                    nationality <span className="text-red-500">* 📘</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-blue-900 font-medium" placeholder="Enter nationality" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Family Status (Required) */}
              <FormField
                control={form.control}
                name="familyStatus"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      Family Status <span className="text-red-500">*🏠</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="text-blue-900 font-medium" >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger  >
                        <SelectContent className="text-blue-900 font-medium" >
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem  value="married_with_children">
                            Married with Children
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Annual Income (Optional) */}
              <FormField
                control={form.control}
                name="incomeLevel"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Monthly Income <span className='text-md font-bold' >(€)</span> 💶</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="text-blue-900 font-medium"
                        placeholder="Monthly income"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Location Type (Optional) */}
              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Location Type 🏕️</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="text-blue-900 font-medium">
                          <SelectValue  placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent className="text-blue-900 font-medium" >
                          <SelectItem value="urban">Urban</SelectItem>
                          <SelectItem value="suburban">Suburban</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Spending Behavior (Optional) */}
              <FormField
                control={form.control}
                name="spendingBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spending Behavior 💳</FormLabel> 
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="text-blue-900 font-medium" >
                          <SelectValue placeholder="Select spending behavior" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frugal">Frugal</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="spendthrift">
                            Spendthrift
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Textarea for Random Information */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter any additional information here"
                      rows={4}
                      className="text-blue-900 font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Accordion for Additional Fields */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="financial">
                <AccordionTrigger>More</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Monthly Rent (Optional) */}
                    <FormField
                      control={form.control}
                      name="monthlyRent"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Monthly Rent/Mortgage <span className='text-md font-bold' >(€)</span> 📑</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="text-blue-900 font-medium"
                              placeholder="Amount"
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? undefined : Number(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Monthly Savings (Optional) */}
                    <FormField
                      control={form.control}
                      name="monthlySavings"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Monthly Savings Target <span className='text-md font-bold' >(€)</span> 🔒</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="text-blue-900 font-medium"
                              placeholder="Amount"
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? undefined : Number(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Risk Tolerance (Optional) */}
                    <FormField
                      control={form.control}
                      name="riskTolerance"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Risk Tolerance 🔥</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="text-blue-900 font-medium" >
                                <SelectValue placeholder="Select risk level" />
                              </SelectTrigger>
                              <SelectContent className="text-blue-900 font-medium" >
                                <SelectItem value="conservative">
                                  Conservative
                                </SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="aggressive">
                                  Aggressive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Credit Card Usage (Optional) */}
                    <FormField
                      control={form.control}
                      name="creditCards"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Credit Card Usage 💳</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="text-blue-900 font-medium" >
                                <SelectValue placeholder="Select usage pattern" />
                              </SelectTrigger>
                              <SelectContent className="text-blue-900 font-medium" >
                                <SelectItem value="rarely">Rarely</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="frequent">Frequent</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Work Schedule (Optional) */}
                    <FormField
                      control={form.control}
                      name="workSchedule"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Work Schedule 📅</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="text-blue-900 font-medium" >
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                              <SelectContent className="text-blue-900 font-medium" >
                                <SelectItem value="regular">Regular (9-5)</SelectItem>
                                <SelectItem value="shift">Shift Work</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Primary Transportation (Optional) */}
                    <FormField
                      control={form.control}
                      name="transportation"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Primary Transportation 🚲</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="text-blue-900 font-medium" >
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent className="text-blue-900 font-medium" >
                                <SelectItem value="car">Personal Car</SelectItem>
                                <SelectItem value="public">
                                  Public Transit
                                </SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Dining Preference (Optional) */}
                    <FormField
                      control={form.control}
                      name="diningPreference"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Dining Preference 🍽️</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="text-blue-900 font-medium" >
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                              <SelectContent className="text-blue-900 font-medium" >
                                <SelectItem value="homeCook">Home Cook</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                                <SelectItem value="eatOut">Eat Out</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Shopping Habits (Optional) */}
                    <FormField
                      control={form.control}
                      name="shoppingHabits"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Shopping Habits 🛒</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="text-blue-900 font-medium" >
                                <SelectValue placeholder="Select habits" />
                              </SelectTrigger>
                              <SelectContent className="text-blue-900 font-medium" >
                                <SelectItem value="planner">
                                  Planned Purchases
                                </SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                                <SelectItem value="impulsive">
                                  Impulsive Buyer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-end">
              <Button type="submit">Generate Data</Button>
            </div>
          </form>
        </Form>
        } 

      {
        steps[3].status === "completed" && (<CardFooter className="flex items-center justify-center">
        <Button onClick={()=> router.push("/dashboard") } className="w-full" >go to dashboard</Button>
        </CardFooter>)
      }

      </CardContent>
    </Card>
  );
};

