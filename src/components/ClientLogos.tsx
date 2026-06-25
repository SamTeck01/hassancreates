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
    id: "logo-1",
    src: "https://framerusercontent.com/images/3cWSgJFsUVvZeOw9LdQmTOSVFhE.svg",
    width: 58,
    height: 32,
    alt: "Logo-image",
  },
  {
    id: "logo-2",
    src: "https://framerusercontent.com/images/nfabfL1KTOOmw22T9soWodkE5Q.svg",
    width: 127,
    height: 32,
    alt: "Logo-image",
  },
  {
    id: "logo-3",
    src: "https://framerusercontent.com/images/pFmkT2mGzyfTzJsLN2Lr3fdbIk.svg",
    width: 167,
    height: 32,
    alt: "client-logo",
  },
  {
    id: "logo-4",
    src: "https://framerusercontent.com/images/oqkjAivG8qVmaPBg07Z4Yst8rwk.svg",
    width: 162,
    height: 32,
    alt: "Logo-image",
  },
  {
    id: "logo-5",
    src: "https://framerusercontent.com/images/nmwtsE1SWD34rSXL3OhLE7CTn0.svg",
    width: 83,
    height: 32,
    alt: "Logo-image",
  },
  {
    id: "logo-6",
    src: "https://framerusercontent.com/images/zhMiNUjAyE25vd6XOETCIwS38.svg",
    width: 131,
    height: 32,
    alt: "Logo-image",
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
                      data-framer-name={`Logo Card${(idx % 6) + 1}`}
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
