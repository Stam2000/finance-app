"use client"
import Animation from "@/components/animation";


 const Loading = () => {


  return (
    <>
    <div className="flex flex-col w-full items-center justify-center h-screen" >
      <Animation/>
      <span className="text-slate-400  italic " >
        Loading...
      </span>
    </div>
    </>);
};



export default Loading;