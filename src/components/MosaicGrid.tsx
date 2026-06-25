"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MosaicGrid() {
  return (
    <section className="w-full bg-white flex justify-center pb-6 pt-0 px-1 md:px-3">
      <motion.div
        className="framer-1ax210z w-full max-w-[1400px] overflow-hidden rounded-[24px] aspect-[2848/1604] relative"
        data-framer-name="Banner Image"
        style={{
          willChange: "transform",
          opacity: 1,
          transform: "perspective(3962px)",
        }}
      >
        <div className="framer-zlaa13 absolute inset-0">
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
              src="https://framerusercontent.com/images/dT5S1njJpyHvznBNeTmMAwfBcqQ.png"
              alt="banner-image"
              width={2848}
              height={1604}
              sizes="(min-width: 1440px) max(min(100vw, 1920px) - 16px, 1px), (min-width: 810px) and (max-width: 1439.98px) max(min(100vw, 1920px) - 16px, 1px), (max-width: 809.98px) max(min(100vw, 1920px) - 16px, 1px)"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "inherit",
                objectPosition: "center",
                objectFit: "cover",
                cornerShape: "inherit",
              } as React.CSSProperties & { cornerShape?: string }}
              priority
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
