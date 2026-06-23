"use client";

import React from "react";
import { motion } from "framer-motion";

interface StaggeredTextProps {
  text: string;
  delay?: number;
  className?: string;
  once?: boolean;
  trigger?: "onload" | "scroll";
  letterStyle?: React.CSSProperties;
}

export default function StaggeredText({
  text,
  delay = 0,
  className,
  once = true,
  trigger = "onload",
  letterStyle,
}: StaggeredTextProps) {
  const words = text.split(" ");
  let charIndex = 0;
  const isScroll = trigger === "scroll";

  return (
    <span className={className}>
      {words.map((word, wIdx) => {
        const letters = Array.from(word);
        const isLastWord = wIdx === words.length - 1;

        return (
          <span key={wIdx} className="inline-block whitespace-nowrap">
            {letters.map((char, lIdx) => {
              const currentDelay = delay + charIndex * 0.02;
              charIndex++;

              const animationProps = isScroll
                ? {
                    whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
                    viewport: { once, margin: "-50px" },
                  }
                : {
                    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
                  };

              return (
                <motion.span
                  key={lIdx}
                  initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
                  {...animationProps}
                  transition={{
                    duration: 0.5,
                    delay: currentDelay,
                    ease: [0.2, 0.65, 0.3, 1],
                  }}
                  style={{
                    display: "inline-block",
                    willChange: "transform, opacity, filter",
                    ...letterStyle,
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
            {!isLastWord && (() => {
              const spaceDelay = delay + charIndex * 0.02;
              charIndex++; // Advance index for space so next letters are delayed correctly

              const spaceProps = isScroll
                ? {
                    whileInView: { opacity: 1 },
                    viewport: { once, margin: "-50px" },
                  }
                : {
                    animate: { opacity: 1 },
                  };

              return (
                <motion.span
                  key={`space-${wIdx}`}
                  initial={{ opacity: 0 }}
                  {...spaceProps}
                  transition={{ delay: spaceDelay, duration: 0.2 }}
                  style={{
                    display: "inline-block",
                    ...letterStyle,
                  }}
                >
                  &nbsp;
                </motion.span>
              );
            })()}
          </span>
        );
      })}
    </span>
  );
}
