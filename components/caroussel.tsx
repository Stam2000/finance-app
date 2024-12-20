import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { MoveRight, MoveLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Button } from "./ui/button";
import { WandSparkles } from "lucide-react";

type CarouselProps = {
  elements: {
    jsx: JSX.Element;
    title: string;
  }[];
};

const Carousel = ({ elements }: CarouselProps) => {
  const [isActive, setIsActive] = useState(0);
  const [direction, Setdirection] = useState("");

  return (
    <div className="relative rounded-2xl border-[2px] mt-10 md:mt-0   p-1 border-white">
      <ScrollArea className="relative overflow-x-hidden pt-14 bg-slate-50 rounded-xl h-64 lg:h-72 w-full overflow-auto  pb-2 px-3">
        <div className="absolute overflow-x-hidden flex  items-center justify-center top-1 right-0 left-0">
          <motion.div className="text-slate-900 overflow-x-hidden font-oxygen font-family:Roboto rounded-lg my-1 font-bold text-md md:text-xl flex gap-2">
            {elements.map((e, i) => (
              <Button
                key={i}
                onClick={() => {
                  setIsActive(i);
                }}
                className={` ${isActive === i ? "bg-slate-200 text-slate-950 hover:text-white" : "bg-transparent hover:text-white border text-slate-950 "} px-2 py-0`}
              >
                {e.title}
                {e.title === "Weekly Review" && (
                  <WandSparkles size={14} className="ml-1" />
                )}
              </Button>
            ))}
          </motion.div>
        </div>

        <motion.div
          key={isActive}
          animate={{ x: 0 }}
          initial={{
            x: direction === "left" ? "-30%" : "30%",
          }}
          className="overflow-x-hidden  mt-3"
        >
          {elements[isActive].jsx}
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default Carousel;
