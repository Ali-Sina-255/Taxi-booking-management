// src/components/FlyingImage.jsx

import React from "react";
import { motion } from "framer-motion";

const FlyingImage = ({ animationData, onAnimationComplete }) => {
  if (!animationData) {
    return null;
  }

  const { startRect, endRect, imgSrc } = animationData;

  // Calculate the difference in position for the animation
  const x =
    endRect.left - startRect.left + endRect.width / 2 - startRect.width / 2;
  const y =
    endRect.top - startRect.top + endRect.height / 2 - startRect.height / 2;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        zIndex: 100, // Make sure it's on top of everything
      }}
      initial={{
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
      }}
      animate={{
        opacity: [1, 1, 0.5, 0],
        scale: [1, 1.1, 0.2],
        x: [0, x, x],
        y: [0, y, y],
        borderRadius: ["2%", "5%", "50%"],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        times: [0, 0.5, 0.9, 1], // Control the timing of keyframes
      }}
      onAnimationComplete={onAnimationComplete}
    >
      <img
        src={imgSrc}
        alt="Animating product"
        className="w-full h-full object-cover rounded-md"
      />
    </motion.div>
  );
};

export default FlyingImage;
