"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const TICKER_1_ITEMS = ["Motion Design", "Website Design", "Logo Design", "Brand Design"];
const TICKER_2_ITEMS = ["Senior Designer", "10 Years of Experience", "Over 100 Customers"];

// Duplicate the items to allow a seamless infinite loop
const DUPLICATED_T1 = [...TICKER_1_ITEMS, ...TICKER_1_ITEMS, ...TICKER_1_ITEMS, ...TICKER_1_ITEMS];
const DUPLICATED_T2 = [...TICKER_2_ITEMS, ...TICKER_2_ITEMS, ...TICKER_2_ITEMS, ...TICKER_2_ITEMS];

export default function DoubleMarquee() {
  return (
    <div
      className="framer-lBZiR framer-ua8w7x framer-v-ua8w7x w-full relative overflow-hidden h-[260px] md:h-[320px] flex items-center bg-brand-bg">
      <div className="framer-z8e0e6 w-full h-full relative overflow-hidden" style={{ opacity: 1 }}>
        {/* Ticker 1 (Brand Purple, Rotated 6deg) */}
        <div
          className="framer-1plw6dc absolute left-[-10%] right-[-10%] top-1/2 py-2 md:py-4 flex items-center"
          style={{
            backgroundColor: "var(--color-brand-purple, #6B21D9)",
            transform: "translateY(-50%) rotate(6deg)",
            opacity: 1,
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <div className="framer-14o6jgy-container w-full" style={{ opacity: 1 }}>
            <section
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                placeItems: "center",
                margin: "0px",
                padding: "0px",
                listStyleType: "none",
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
                  gap: "32px",
                  position: "relative",
                  flexDirection: "row",
                  willChange: "transform",
                }}
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  ease: "linear",
                  duration: 20,
                  repeat: Infinity,
                }}
              >
                {DUPLICATED_T1.map((item, idx) => (
                  <li
                    key={`t1-${idx}`}
                    style={{ height: "48px", display: "flex", alignItems: "center" }}
                    aria-hidden="true"
                  >
                    <div
                      className="framer-1t68jmf-container flex items-center gap-3"
                      style={{ height: "48px", flexShrink: 0 }}
                    >
                      <div
                        className="framer-hKCg0 framer-93Efc framer-RWexF framer-sq3wzi framer-v-sq3wzi flex items-center gap-3"
                        style={{ opacity: 1 }}
                      >
                        <div
                          className="framer-hen3c7 relative w-[19px] h-[19px]"
                          style={{ opacity: 1 }}
                        >
                          <Image
                            src="https://framerusercontent.com/images/InxDM6L8xjRn2ZsMquQwkLQ0VLA.svg"
                            alt="Flower"
                            width={19}
                            height={19}
                            style={{
                              display: "block",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            unoptimized
                          />
                        </div>
                        <div className="framer-o0nci6 flex items-center">
                          <h5 className="font-kyiv text-[20px] md:text-[28px] font-bold text-white uppercase tracking-tight whitespace-nowrap">
                            {item}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </section>
          </div>
        </div>

        {/* Ticker 2 (Black, Rotated -6deg) */}
        <div
          className="framer-roxzff absolute left-[-10%] right-[-10%] top-1/2 py-2 md:py-4 flex items-center"
          style={{
            backgroundColor: "var(--token-ac88bdb2-3c45-418b-8250-5746da7a4cc4, rgb(0, 0, 0))",
            transform: "translateY(-50%) rotate(-6deg)",
            opacity: 1,
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <div className="framer-os4ahh-container w-full" style={{ opacity: 1 }}>
            <section
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                placeItems: "center",
                margin: "0px",
                padding: "0px",
                listStyleType: "none",
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
                  gap: "32px",
                  position: "relative",
                  flexDirection: "row",
                  willChange: "transform",
                }}
                animate={{ x: ["-50%", "0%"] }}
                transition={{
                  ease: "linear",
                  duration: 20,
                  repeat: Infinity,
                }}
              >
                {DUPLICATED_T2.map((item, idx) => (
                  <li
                    key={`t2-${idx}`}
                    style={{ height: "48px", display: "flex", alignItems: "center" }}
                    aria-hidden="true"
                  >
                    <div
                      className="framer-1cs5y83-container flex items-center gap-3"
                      style={{ height: "48px", flexShrink: 0 }}
                    >
                      <div
                        className="framer-hKCg0 framer-93Efc framer-RWexF framer-sq3wzi framer-v-sq3wzi flex items-center gap-3"
                        style={{ opacity: 1 }}
                      >
                        <div
                          className="framer-hen3c7 relative w-[19px] h-[19px]"
                          style={{ opacity: 1 }}
                        >
                          <Image
                            src="https://framerusercontent.com/images/InxDM6L8xjRn2ZsMquQwkLQ0VLA.svg"
                            alt="Flower"
                            width={19}
                            height={19}
                            style={{
                              display: "block",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            unoptimized
                          />
                        </div>
                        <div className="framer-o0nci6 flex items-center">
                          <h5 className="font-kyiv text-[20px] md:text-[28px] font-bold text-white uppercase tracking-tight whitespace-nowrap">
                            {item}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
