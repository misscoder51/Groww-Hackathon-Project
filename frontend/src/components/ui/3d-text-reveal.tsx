"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TextReveal3DProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal3D: React.FC<TextReveal3DProps> = ({
  text,
  className = "",
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: 16,
          rotateX: -45,
        },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 120,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ perspective: 1000 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block mr-[0.25em] last:mr-0 transform-gpu"
          style={{ transformStyle: "preserve-3d", transformOrigin: "bottom center" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default TextReveal3D;
