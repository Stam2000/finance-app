import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { MoveRight,MoveLeft } from "lucide-react";
import { motion,AnimatePresence } from "framer-motion";
import { useRef } from "react";

type CarouselProps = {
  elements: { 
    jsx: JSX.Element; 
    title: string; 
  }[];
};

const Carousel = ( {elements}:CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const prev = useRef<SVGSVGElement>(null)
    const next = useRef<SVGSVGElement>(null)
    const [direction,Setdirection] = useState("")
  
    const nextSlide = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === elements.length - 1 ? 0 : prevIndex + 1
      );
    };
  
    const prevSlide = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? elements.length - 1 : prevIndex - 1
      );
    };

    const handleOnClick = (event:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const id = event.currentTarget.id
      if(id==="moveLeft"){

        prevSlide()        
        Setdirection("left")
      }else if(id==="moveRight"){
        nextSlide()
        Setdirection("right")
      }

      console.log(direction)
    }

    return (
      <div className="relative rounded-2xl border-[2px]  p-1 border-white" >
      <ScrollArea className="relative overflow-x-hidden pt-10 bg-slate-50 rounded-xl h-72 w-full overflow-auto  pb-8 px-3">
      <div className="absolute overflow-x-hidden flex  items-center justify-center top-1 right-0 left-0">
        
            <motion.span
              key={currentIndex}
              initial={{
                x: direction === 'left' ? '-30%' : '30%',
              }}
              animate={{ x: 0 }}
              
              className="text-slate-950 overflow-x-hidden underline decoration-4 decoration-sky-800 font-family:Roboto rounded-lg font-bold text-xl px-2" >
                {elements[currentIndex].title}:
            </motion.span>
          
        </div>
       
          <motion.div
            key={currentIndex}
            animate={{ x: 0 }}
            initial={{
              x: direction === 'left' ? '-30%' : "30%"
            }}
            
            className="overflow-x-hidden">
            {elements[currentIndex].jsx}
          </motion.div>
   
        <div className="absolute bottom-0 right-0 left-0">
          <div className="flex items-center justify-center" >
            <MoveLeft  id="moveLeft" className="text-slate-500 hover:cursor-pointer hover:text-black" onClick={handleOnClick} />
            <MoveRight id="moveRight" className="text-slate-500 hover:cursor-pointer hover:text-black" onClick={handleOnClick} />
          </div>
        </div>
      </ScrollArea>
      </div>
    );
  };

export default Carousel