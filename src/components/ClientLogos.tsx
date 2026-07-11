"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface LogoItem {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}

const LOGOS: LogoItem[] = [
  {
    id: "logo-afrinix",
    src: "/logos/afrinix-logo.png",
    width: 32,
    height: 32,
    alt: "Afrinix logo",
  },
  {
    id: "logo-fproject",
    src: "/logos/f-project.png",
    width: 24,
    height: 32,
    alt: "F Project logo",
  },
  {
    id: "logo-fhenix",
    src: "/logos/fhenix-logo.svg",
    width: 174,
    height: 32,
    alt: "Fhenix Logo",
  },
  {
    id: "logo-loopin",
    src: "/logos/loopin-network-logo.svg",
    width: 110,
    height: 32,
    alt: "Loopin Network logo",
  },
  {
    id: "logo-morphllm",
    src: "/logos/morphllm-logo.svg",
    width: 125,
    height: 32,
    alt: "Morphllm logo",
  },
  {
    id: "logo-pelargo",
    src: "/logos/pelargo-logo.svg",
    width: 67,
    height: 32,
    alt: "Pelargo Logo",
  },
  {
    id: "logo-solace",
    src: "/logos/solace-logo.svg",
    width: 76,
    height: 32,
    alt: "Solace logo",
  },
  {
    id: "logo-switchlabs",
    src: "/logos/switch-labs-logo.svg",
    width: 66,
    height: 32,
    alt: "Switch labs Logo",
  },
];

// Triple the logos to guarantee a seamless continuous loop
const DUPLICATED_LOGOS = [...LOGOS, ...LOGOS, ...LOGOS];

export default function ClientLogos() {
  return (
    <section className="w-full bg-white py-16 flex flex-col items-center">
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center font-kyiv-sans font-normal uppercase tracking-[0.14em] text-[#888] mb-12 select-none text-[12px]"
      >
        Brands I&apos;ve worked with
      </motion.p>

      {/* Marquee Wrapper */}
      <div
        className="framer-hf96re-container w-full"
        style={{
          willChange: "transform",
          opacity: 1,
          transform: "none",
        }}
      >
        <div
          className="framer-nv5Gc framer-anhk9k framer-v-anhk9k w-full max-w-full"
          data-framer-name="Primary"
          style={{ opacity: 1 }}
        >
          <div className="framer-yhooem-container" style={{ opacity: 1 }}>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                placeItems: "center",
                margin: "0px",
                padding: "0px",
                opacity: 1,
                maskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)",
                WebkitMaskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)",
                overflow: "hidden",
              }}
            >
              <motion.ul
                style={{
                  display: "flex",
                  width: "max-content",
                  height: "100%",
                  placeItems: "center",
                  margin: "0px",
                  padding: "0px",
                  listStyleType: "none",
                  gap: "80px",
                  position: "relative",
                  flexDirection: "row",
                  willChange: "transform",
                }}
                animate={{ x: ["0%", "-33.33%"] }}
                transition={{
                  ease: "linear",
                  duration: 25,
                  repeat: Infinity,
                }}
              >
                {DUPLICATED_LOGOS.map((logo, idx) => (
                  <li
                    key={`${logo.id}-${idx}`}
                    style={{
                      height: "32px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="framer-19lyshx-container relative"
                      data-framer-name={`Logo Card${(idx % LOGOS.length) + 1}`}
                      style={{
                        height: "32px",
                        width: `${logo.width}px`,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        className="framer-Pbrak framer-4p62wa framer-v-4p62wa w-full h-full"
                        style={{ opacity: 1 }}
                      >
                        <div
                          className="framer-dfmnw2 w-full h-full relative"
                          style={{ opacity: 1 }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              borderRadius: "inherit",
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                              cornerShape: "inherit",
                            } as React.CSSProperties & { cornerShape?: string }}
                            data-framer-background-image-wrapper="true"
                          >
                            <Image
                              src={logo.src}
                              alt={logo.alt}
                              width={logo.width}
                              height={logo.height}
                              style={{
                                display: "block",
                                width: "100%",
                                height: "100%",
                                borderRadius: "inherit",
                                objectPosition: "center",
                                objectFit: "contain",
                                cornerShape: "inherit",
                              } as React.CSSProperties & { cornerShape?: string }}
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
