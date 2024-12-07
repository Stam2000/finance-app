"use client"
import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { shuffle } from "lodash";

const ColorAnimation = ({ 
  initialColors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"],
  itemWidth = 40,
  itemHeight = 40,
  itemMarginRight = 2.5,
  itemMarginBottom = 0,
  containerWidth = 200,
  shuffleInterval = 1000
}) => {
  const [colors, setColors] = useState(initialColors);

  const spring = {
    type: "spring",
    damping: 20,
    stiffness: 300
  };

  useEffect(() => {
    const intervalId = setTimeout(() => setColors(shuffle(colors)), shuffleInterval);
    return () => clearTimeout(intervalId);
  }, [colors, shuffleInterval]);

  return (
    <ul 
      className={`flex items-center justify-center `} 
      style={{ width: `${containerWidth}px` }}
    >
      {colors.map((background) => (
        <motion.li
          key={background}
          layout
          transition={spring}
          className="rounded-full"
          style={{ 
            background, 
            width: `${itemWidth}px`, 
            height: `${itemHeight}px`, 
            marginRight: `${itemMarginRight}px`, 
            marginBottom: `${itemMarginBottom}px` 
          }}
        />
      ))}
    </ul>
  );
};

export default ColorAnimation;