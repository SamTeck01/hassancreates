"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import StaggeredText from "./StaggeredText";

interface CardData {
  tags: string[];
  headline: string;
  body: string;
  images: string[];
}

const CARDS: CardData[] = [
  {
    tags: ["Logo Design", "Brand Systems"],
    headline: "Branding",
    body: "Building strong and memorable brand identities that communicate your story, values, and personality. From logo to full visual systems, I design brands that feel",
    images: ["/works/blackopal-1.jpg", "/works/blackopal-2.jpg", "/project-branding.jpg"],
  },
  {
    tags: ["Framer Development", "Animation"],
    headline: "Framer Development",
    body: "Turning design into fast, interactive, and scalable websites using Framer. I build smooth, modern websites",
    images: ["/works/archin-1.jpg", "/works/archin-2.jpg", "/project-framer.jpg"],
  },
  {
    tags: ["UI/UX Design", "Responsive"],
    headline: "Web Design",
    body: "Fast, functional, and beautifully designed websites, built to perform across devices and convert visitors into clients.",
    images: ["/works/apex-1.jpg", "/works/apex-2.jpg", "/project-web.jpg"],
  },
];

function ServiceCardStack({ images, isDark }: { images: string[]; isDark?: boolean }) {
  const [stack, setStack] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStack((prev) => {
        // Shuffles the front card (index 2) to the back (index 0)
        const [back, middle, front] = prev;
        return [front, back, middle];
      });
    }, 1000); // 1 second interval
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[190px] h-[210px] flex items-center justify-end flex-shrink-0 md:mr-4 select-none">
      {images.map((img, index) => {
        const position = stack.indexOf(index);
        return (
          <motion.div
            key={img}
            className="absolute right-0 w-[136px] h-[190px] rounded-[20px] overflow-hidden border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white origin-bottom"
            animate={{
              x: position === 0 ? [0, 50, -36] : position === 1 ? -18 : 0,
              scale: position === 0 ? [1, 1.02, 0.9] : position === 1 ? 0.95 : 1,
              zIndex: position === 0 ? 10 : position === 1 ? 20 : 30,
              opacity: position === 0 ? [1, 1, 0.75] : position === 1 ? 0.9 : 1,
            }}
            transition={{
              duration: 0.65,
              ease: [0.25, 1, 0.5, 1],
              zIndex: {
                delay: position === 0 ? 0.25 : 0,
                duration: 0,
              }
            }}
          >
            <Image
              src={img}
              alt=""
              fill
              sizes="136px"
              className="object-cover pointer-events-none"
              priority={index === 0}
            />

            {/* Pagination Dots Overlay inside the front card */}
            {position === 2 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-40 pointer-events-none">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stack[2] === i
                      ? (isDark ? "bg-white w-3" : "bg-black/70 w-3")
                      : (isDark ? "bg-white/30" : "bg-black/20")
                      }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Services() {
  return (
    <section id="about" className="bg-[#F8F8FA] text-black py-[120px] pb-[80px] px-3 relative z-10">
      <div className="max-w-[900px] mx-auto flex flex-col">

        {/* Section Label */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="framer-4zfn48 flex items-center justify-start gap-1 mb-4 select-none"
        >
          <div className="framer-a664sh" style={{ transform: "none" }}>
            <p
              className="font-kyiv font-light text-[15px]"
              style={{ color: "#6B21D9" }}
            >
              (
            </p>
          </div>
          <span className="font-kyiv-sans font-medium text-[13px] tracking-[-0.12em] text-[#0D0D0D]">
            services
          </span>
          <div className="framer-18f87tz" style={{ transform: "none" }}>
            <p
              className="font-kyiv font-light text-[15px]"
              style={{ color: "#6B21D9" }}
            >
              )
            </p>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="framer-1d876bs" data-framer-name="Content">
          <div className="framer-p0ih05-container" data-framer-name="Reveal Text">
            <h2 className="font-kyiv text-[32px] md:text-[52px] font-bold leading-[1.1] text-[#0D0D0D] max-w-[90%] mb-16 tracking-[-0.02em]">
              <StaggeredText
                text="Your Competitors Didn't Get Better."
                trigger="scroll"
                delay={0.1}
              />
              <span className="text-[#888] font-normal ml-2 block md:inline">
                <StaggeredText
                  text="They Just Rebranded First."
                  trigger="scroll"
                  delay={0.6}
                />
              </span>
            </h2>
          </div>
        </div>

        {/* Stacked Service Cards */}
        <div className="flex flex-col gap-6 w-full mb-16">
          {CARDS.map((card, index) => (
            <motion.div
              key={card.headline}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -6,
                borderColor: "rgba(107,33,217,0.20)",
                boxShadow: "0 24px 60px rgba(107,33,217,0.08)",
              }}
              className="group bg-white border border-black/6 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)] cursor-pointer"
            >
              {/* Left text side */}
              <div className="flex-1 flex flex-col items-start text-left">
                {/* Title */}
                <h3 className="font-kyiv-sans font-bold text-3xl md:text-[42px] text-[#0D0D0D] tracking-[-0.04em] leading-[1.05] mb-4">
                  {card.headline}
                </h3>

                {/* Tags row */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 rounded-full bg-white border border-[#E4E2F1] text-[#08070D] text-[12px] md:text-[13px] font-medium font-kyiv-sans tracking-tight"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Body */}
                <p className="font-kyiv-sans text-[15px] md:text-[16px] leading-relaxed text-[#555] font-light max-w-[90%]">
                  {card.body}
                </p>
              </div>

              {/* Right stacked cards side */}
              <div className="w-full md:w-auto flex justify-center md:justify-end py-6 md:py-0">
                <ServiceCardStack images={card.images} isDark={index === 2} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section End CTA */}
        <motion.a
          href="#contact"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{
            backgroundColor: "#6B21D9",
            y: -3,
            boxShadow: "0 12px 40px rgba(107,33,217,0.40)",
          }}
          className="w-full h-18 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center gap-2 font-kyiv font-medium text-lg md:text-xl transition-all duration-300 cursor-pointer"
        >
          <span>● Take the first step. Get in touch</span>
        </motion.a>

      </div>
    </section>
  );
}
