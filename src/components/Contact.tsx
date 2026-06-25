"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   Marquee — exact conversion of Framer's TextCard + marquee section
   ──────────────────────────────────────────────────────────────────────────── */

const FLOWER_SRC =
  "https://framerusercontent.com/images/bPFUMYGmKDGU6pubiY2MFnjtBAk.svg";
// Hassan's email split at @ so we can colour the @ sign orange
const EMAIL_USER   = "hassancreatess";
const EMAIL_DOMAIN = "gmail.com";
const EMAIL_FULL   = `${EMAIL_USER}@${EMAIL_DOMAIN}`;

// 14 copies → doubled inside the ul = 28 items, enough for any viewport
const MARQUEE_ITEMS = Array.from({ length: 14 });

function TextCard() {
  return (
    /* framer-hnin5j framer-v-hnin5j — flex row, items-center */
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 40,
        flexShrink: 0,
      }}
    >
      {/* framer-xs164w — 16×16 flower icon */}
      <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          decoding="auto"
          width={16}
          height={16}
          src={`${FLOWER_SRC}?width=16&height=16`}
          alt="Flower"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            borderRadius: "inherit",
            objectPosition: "center",
            objectFit: "cover",
          }}
        />
      </div>

      {/* framer-c8zjw — email text */}
      <div>
        <h5 style={{ margin: 0 }}>
          <a
            href={`mailto:${EMAIL_FULL}`}
            target="_blank"
            rel="noopener"
            tabIndex={-1}
            className="font-kyiv-sans text-[30px] font-normal text-white no-underline"
          >
            {EMAIL_USER}
            <span className="text-brand-purple">@</span>
            {EMAIL_DOMAIN}
          </a>
        </h5>
      </div>
    </div>
  );
}

function ContactMarquee() {
  // Double the items array so the CSS animation loops seamlessly
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    /* framer-17t0ii8-container → framer-fObVj → section */
    <section
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        placeItems: "center",
        margin: 0,
        padding: 0,
        listStyleType: "none",
        opacity: 1,
        maskImage:
          "linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)",
        overflow: "hidden",
      }}
    >
      {/* Keyframe injected inline — no globals.css needed */}
      <style>{`
        @keyframes hc-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      {/* framer ul — flex row, gap 32px, CSS scroll animation */}
      <ul
        style={{
          display: "flex",
          width: "max-content",
          height: "100%",
          placeItems: "center",
          margin: 0,
          padding: 0,
          listStyleType: "none",
          gap: 32,
          position: "relative",
          flexDirection: "row",
          animation: "hc-marquee 42s linear infinite",
          willChange: "transform",
        }}
      >
        {items.map((_, i) => (
          <li key={i} style={{ height: 40, flexShrink: 0 }} aria-hidden>
            {/* framer-tjrn1-container */}
            <div style={{ height: 40, flexShrink: 0 }}>
              <TextCard />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Contact component
   ──────────────────────────────────────────────────────────────────────────── */

type FormState = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, amount: 0.08 });

  const [formState, setFormState] = useState<FormState>("idle");
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [desc,  setDesc]  = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");

    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, description: desc }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Contact form error:", data.error);
        setFormState("error");
        return;
      }

      setFormState("sent");
      setName(""); setEmail(""); setDesc("");
    } catch (err) {
      console.error("Contact form network error:", err);
      setFormState("error");
    }
  };

  /* ── animation variants ── */
  const headingVariants = {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
  };
  const cardVariants = {
    hidden:  { opacity: 0, y: 56, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
  };

  /* Shared input/textarea styling matching Framer's CSS vars */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.24)",
    color: "rgb(255,255,255)",
    outline: "none",
    fontSize: 15,
    fontFamily: "inherit",
    padding: "8px 0",
  };

  return (
    /* framer-15fgz2y — Bottom */
    <section
      ref={sectionRef}
      id="contact"
      className="w-full bg-white pt-24 px-2.5 pb-2.5 overflow-hidden max-[809px]:pt-12 max-[809px]:px-0"
      data-framer-name="Contact-Section"
    >
      <div className="w-[calc(min(100vw,1920px)-16px)] mx-auto flex flex-col gap-14 max-[809px]:gap-8">

        {/* ── Section heading — same pattern as SelectedWorks ── */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-2.5 w-full max-w-[1080px] mx-auto px-4 box-border max-[809px]:items-start max-[809px]:gap-2 max-[809px]:px-6"
        >
          <p className="font-kyiv-sans text-[14px] font-normal leading-normal text-[#5c5c5c] m-0 shrink-0">
            (Get in Touch)
          </p>
          <div className="flex items-end">
            <h2 className="font-kyiv text-[clamp(48px,5.5vw,80px)] font-normal leading-none tracking-[-0.02em] m-0 bg-clip-text text-transparent bg-gradient-to-b from-[#0c0c0c]/82 to-[#0c0c0c]/50">
              Contact Me
            </h2>
          </div>
        </motion.div>

        {/* ── framer-1otrif5 — Container (the dark card) ── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          data-framer-name="Container"
          style={{
            borderRadius: 32,
            position: "relative",
            overflow: "hidden",
            width: "100%",
            opacity: 1,
            willChange: "transform, opacity",
          }}
        >
          {/* Absolute background image — exact Framer srcset */}
          <div
            style={{
              position: "absolute",
              borderRadius: "inherit",
              top: 0, right: 0, bottom: 0, left: 0,
            }}
            data-framer-background-image-wrapper="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="auto"
              width={2848}
              height={1464}
              sizes="(min-width: 1440px) calc(min(100vw, 1920px) - 16px), (min-width: 810px) and (max-width: 1439.98px) calc(min(100vw, 1920px) - 16px), (max-width: 809.98px) calc(min(100vw, 1920px) - 16px)"
              srcSet="https://framerusercontent.com/images/1sREGvYWbdhqXmijCOMUIsD7A.png?scale-down-to=512 512w,https://framerusercontent.com/images/1sREGvYWbdhqXmijCOMUIsD7A.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/1sREGvYWbdhqXmijCOMUIsD7A.png?scale-down-to=2048 2048w,https://framerusercontent.com/images/1sREGvYWbdhqXmijCOMUIsD7A.png 2848w"
              src="https://framerusercontent.com/images/1sREGvYWbdhqXmijCOMUIsD7A.png"
              alt="contact-bg"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "inherit",
                objectPosition: "center",
                objectFit: "cover",
              }}
            />
          </div>

          {/* framer-1thbmku — Content */}
          <div data-framer-name="Content" style={{ opacity: 1, position: "relative", zIndex: 1 }}>

            {/* framer-1m68qou — Top (Left + Right flex row) */}
            <div
              data-framer-name="Top"
              className="flex flex-row items-start max-[809px]:flex-col"
              style={{ padding: "48px 48px 40px 48px", gap: 58 }}
            >
              {/* framer-lf7qwi — Left */}
              <div
                data-framer-name="Left"
                className="flex flex-col max-[809px]:w-full"
                style={{ gap: 16, flex: "0 0 auto", maxWidth: 480 }}
              >
                {/* framer-104zw53 — h2 heading */}
                <div style={{ opacity: 1 }}>
                  <h2
                    className="font-kyiv text-white m-0 text-left"
                    style={{
                      fontSize: "clamp(48px, 5.5vw, 80px)",
                      fontWeight: 400,
                      lineHeight: 0.95,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Got a project in mind?
                  </h2>
                </div>

                {/* framer-10pt3t6 — subtitle */}
                <div style={{ opacity: 1 }}>
                  <p
                    className="font-kyiv-sans m-0"
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.5 }}
                  >
                    Let&apos;s make something happen together
                  </p>
                </div>
              </div>

              {/* framer-1u7niw7 — Right */}
              <div
                data-framer-name="Right"
                className="flex-1 min-w-0 max-[809px]:w-full"
                style={{ opacity: 1 }}
              >
                {/* framer-hf7jh — Form-Wrap */}
                <div data-framer-name="Form-Wrap" style={{ opacity: 1 }}>

                  {formState === "sent" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-start"
                      style={{ gap: 12, paddingBlock: "48px 0" }}
                    >
                      <span className="font-kyiv text-white" style={{ fontSize: 40, lineHeight: 1 }}>✓</span>
                      <p className="font-kyiv-sans m-0" style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
                        Message sent! I&apos;ll get back to you soon.
                      </p>
                    </motion.div>

                  ) : formState === "error" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-start"
                      style={{ gap: 16, paddingBlock: "48px 0" }}
                    >
                      <span className="font-kyiv" style={{ fontSize: 40, color: "rgba(255,255,255,0.6)", lineHeight: 1 }}>✗</span>
                      <p className="font-kyiv-sans m-0" style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
                        Something went wrong. Email me directly at{" "}
                        <a href="mailto:hassancreatess@gmail.com" className="underline text-white">
                          hassancreatess@gmail.com
                        </a>
                      </p>
                      <button
                        onClick={() => setFormState("idle")}
                        className="font-kyiv-sans underline transition-colors"
                        style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", background: "none", border: "none" }}
                      >
                        Try again
                      </button>
                    </motion.div>

                  ) : (
                    /* framer-cyaeah — form */
                    <form onSubmit={handleSubmit} style={{ opacity: 1, position: "relative", display: "flex", flexDirection: "column", gap: 24 }}>

                      {/* ── Name field — framer-19pmb7p ── */}
                      <label style={{ opacity: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        {/* framer-1i0lju4 — Label */}
                        <div style={{ opacity: 1 }}>
                          <p className="font-kyiv-sans m-0" style={{ color: "rgb(255,255,255)", fontSize: 13, fontWeight: 500 }}>
                            Your Name
                          </p>
                        </div>
                        {/* framer-1rccpuv — input wrapper */}
                        <div style={{ opacity: 1 }}>
                          <input
                            type="text"
                            required
                            name="Name"
                            placeholder="Enter your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="font-kyiv-sans"
                            style={{
                              ...inputStyle,
                              // Placeholder via CSS class below
                            }}
                          />
                        </div>
                      </label>

                      {/* ── Email field — framer-1w05qjk ── */}
                      <label style={{ opacity: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ opacity: 1 }}>
                          <p className="font-kyiv-sans m-0" style={{ color: "rgb(255,255,255)", fontSize: 13, fontWeight: 500 }}>
                            Your Email
                          </p>
                        </div>
                        <div style={{ opacity: 1 }}>
                          <input
                            type="email"
                            required
                            name="Email"
                            placeholder="Enter the Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="font-kyiv-sans"
                            style={inputStyle}
                          />
                        </div>
                      </label>

                      {/* ── Project Description — framer-r97faa ── */}
                      <label style={{ opacity: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ opacity: 1 }}>
                          <p className="font-kyiv-sans m-0" style={{ color: "rgb(255,255,255)", fontSize: 13, fontWeight: 500 }}>
                            Project Description
                          </p>
                        </div>
                        <div style={{ opacity: 1 }}>
                          <textarea
                            name="Description"
                            placeholder="Type Here..."
                            rows={4}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="font-kyiv-sans"
                            style={{
                              ...inputStyle,
                              resize: "none",
                              display: "block",
                            }}
                          />
                        </div>
                      </label>

                      {/* ── Submit button — framer-ddroly-container ── */}
                      <div style={{ opacity: 1 }}>
                        <motion.button
                          type="submit"
                          disabled={formState === "sending"}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          data-framer-name="Default"
                          style={{
                            backgroundColor: "rgb(220, 220, 220)",
                            borderBottomLeftRadius:  50,
                            borderBottomRightRadius: 50,
                            borderTopLeftRadius:     50,
                            borderTopRightRadius:    50,
                            boxShadow: [
                              "inset 0px 0.5px 0.5px 0px rgba(255,255,255,0.24)",
                              "inset 0px 4px 16px 0px rgba(255,255,255,0.16)",
                              "0px 1px 1px -0.5px rgba(26,26,26,0.08)",
                              "0px 2px 2px -1px rgba(26,26,26,0.08)",
                              "0px 3px 3px -1.5px rgba(26,26,26,0.06)",
                              "0px 5px 5px -2px rgba(26,26,26,0.06)",
                              "0px 12px 12px -6px rgba(26,26,26,0.12)",
                            ].join(", "),
                            opacity: 1,
                            position: "relative",
                            overflow: "hidden",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "14px 32px",
                            border: "none",
                          }}
                        >
                          {/* framer-qox4nh — button text */}
                          <div style={{ opacity: 1, position: "relative", zIndex: 1 }}>
                            <p className="font-kyiv-sans m-0" style={{ color: "rgb(0,0,0)", fontSize: 15 }}>
                              {formState === "sending" ? "Sending…" : "Send Now!"}
                            </p>
                          </div>
                          {/* framer-1kb3eun — inner glow Background */}
                          <div
                            data-framer-name="Background"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.16)",
                              borderRadius: 50,
                              opacity: 1,
                              position: "absolute",
                              inset: 0,
                            }}
                          />
                        </motion.button>
                      </div>

                      {/* Honeypot fields (anti-spam, hidden from users) */}
                      {["website","company","message","subject","title","feedback","notes","details","remarks","comments"].map((n) => (
                        <input
                          key={n}
                          type="text"
                          name={n}
                          tabIndex={-1}
                          autoComplete="one-time-code"
                          aria-hidden="true"
                          style={{ position: "absolute", transform: "scale(0)" }}
                          defaultValue=""
                        />
                      ))}
                    </form>
                  )}

                </div>
              </div>
            </div>

            {/* framer-1yvd6f8-container — Marquee strip (inside the card, below the form) */}
            <div style={{ opacity: 1, width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px 0" }}>
              {/* framer-fObVj framer-v-1o1a0f0 Primary */}
              <div style={{ width: "100%", opacity: 1 }}>
                {/* framer-17t0ii8-container */}
                <div style={{ opacity: 1 }}>
                  <ContactMarquee />
                </div>
              </div>
            </div>

          </div>{/* /framer-1thbmku Content */}
        </motion.div>{/* /framer-1otrif5 Container */}

      </div>

      {/* Placeholder colour for all contact-form inputs/textareas */}
      <style>{`
        #contact input::placeholder,
        #contact textarea::placeholder {
          color: rgba(255, 255, 255, 0.64);
        }
      `}</style>

    </section>
  );
}
