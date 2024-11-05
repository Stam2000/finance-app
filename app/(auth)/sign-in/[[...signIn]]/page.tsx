import { SignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ClerkLoaded,ClerkLoading } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className=" h-full lg:flex flex-col items-center justify-center px-4" >
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-3xl text-bold ">
            Welcome back
          </h1>
          <p className="text-base text-[#7E8CA0]">
            log in or Create account to get back to your dashboard!
          </p>
        </div>
        <div className="flex justify-center items-center mt-8" >
          <ClerkLoading>
            <Loader2 className="animate-spin text-muted-foreground" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignIn />
          </ClerkLoaded>
           
        </div>
       
      
      </div> 
      <div className="h-full hidden lg:flex items-center justify-center bg-blue-700">
        <Image src="/next.svg" height={100} width={100} alt="/logo" />
      </div>
    </div>
  
);
}