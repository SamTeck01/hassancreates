"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import styles from "./SelectedWorks.module.css";

const NOISE_IMG =
  "https://framerusercontent.com/images/hiGYz6grmhAHSeZuNKHEuchTGTw.png";

const PROJECTS = [
  {
    id: "sticky-trigger-01",
    stickyTop: 80,
    zIndex: 10,
    bgImage: "https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png",
    bgSrcSet:
      "https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png?scale-down-to=512 512w,https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png?scale-down-to=2048 2048w,https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png 2848w",
    description:
      "We've helped businesses across industries achieve their goals. Here are some of our selected works.",
    number: "01",
    clientName: "Archin",
    href: "./works/archin",
    coverImage:
      "https://framerusercontent.com/images/olR1jd1vAg59BKYSorw26ZNxY.png",
    coverSrcSet:
      "https://framerusercontent.com/images/olR1jd1vAg59BKYSorw26ZNxY.png?scale-down-to=1024 819w,https://framerusercontent.com/images/olR1jd1vAg59BKYSorw26ZNxY.png 912w",
    year: "2025",
    role: "Lead Designer",
    services: ["Website Design", "Product Design", "Branding", "Development"],
  },
  {
    id: "sticky-trigger-02",
    stickyTop: 96,
    zIndex: 11,
    bgImage: "https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png",
    bgSrcSet:
      "https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png?scale-down-to=512 512w,https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png?scale-down-to=2048 2048w,https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png 2848w",
    description:
      "We've partnered with businesses across various industries to help them achieve their goals.",
    number: "02",
    clientName: "VNTNR",
    href: "./works/vntnr",
    coverImage:
      "https://framerusercontent.com/images/QhPkJGJBXS8kPS7IhPj7ZBGZpII.png",
    coverSrcSet:
      "https://framerusercontent.com/images/QhPkJGJBXS8kPS7IhPj7ZBGZpII.png?scale-down-to=1024 819w,https://framerusercontent.com/images/QhPkJGJBXS8kPS7IhPj7ZBGZpII.png 912w",
    year: "2018",
    role: "Logo Designer",
    services: ["Designing", "Branding", "Redesigning", "Development"],
  },
  {
    id: "sticky-trigger-03",
    stickyTop: 112,
    zIndex: 12,
    bgImage: "https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png",
    bgSrcSet:
      "https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png?scale-down-to=512 512w,https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png?scale-down-to=2048 2048w,https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png 2848w",
    description:
      "We've collaborated with companies from diverse sectors to turn their visions into reality. Here's a look at some of our featured work.",
    number: "03",
    clientName: "Aeorim",
    href: "./works/aeorim",
    coverImage:
      "https://framerusercontent.com/images/yOPV9nZRSJXmNPqyeWfZSThWAc.png",
    coverSrcSet:
      "https://framerusercontent.com/images/yOPV9nZRSJXmNPqyeWfZSThWAc.png?scale-down-to=1024 819w,https://framerusercontent.com/images/yOPV9nZRSJXmNPqyeWfZSThWAc.png 912w",
    year: "2023",
    role: "Website Designer",
    services: ["Branding", "Revamp", "Development", "Designing"],
  },
] as const;

type Project = (typeof PROJECTS)[number];

function WorkCard({
  project,
  isLast,
}: {
  project: Project;
  isLast: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  // Exit: shrink → tilt left → blur away over 60vh
  // blur capped at 8px (fixing-motion-performance rule 7: never large-surface blur >8px)
  const scale   = useTransform(scrollYProgress, [0, 1], [1, 0.80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.4, 0]);
  const rotate  = useTransform(scrollYProgress, [0, 1], [0, -8]); // tilt left
  const blurPx  = useTransform(scrollYProgress, [0, 1], [0, 8]);  // ≤8px per perf skill
  const filter  = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      ref={wrapperRef}
      id={project.id}
      className={styles.cardWrapper}
      style={{
        top: project.stickyTop,
        zIndex: project.zIndex,
        scale:   isLast ? 1 : scale,
        opacity: isLast ? 1 : opacity,
        rotate:  isLast ? 0 : rotate,
        filter:  isLast ? "blur(0px)" : filter,
        // 60vh of scroll space for the full exit animation
        marginBottom: isLast ? 0 : "60vh",
        transformOrigin: "center center",
      }}
    >
      {/* framer-AJQo7 framer-v-1ba6yrb */}
      <div className={styles.cardOuter}>
        {/* framer-148g6gm */}
        <div className={styles.workCard}>

          {/* BG image — absolute fill */}
          <div className={styles.bgImageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="auto"
              width={2848}
              height={1588}
              sizes="(min-width: 1440px) max(max(min(100vw, 1920px) - 16px, 1px), 1px), (min-width: 810px) and (max-width: 1439.98px) max(max(min(100vw, 1920px) - 16px, 1px), 1px), (max-width: 809.98px) max(calc(min(100vw, 1920px) - 16px), 1px)"
              srcSet={project.bgSrcSet}
              src={project.bgImage}
              alt="BG Image"
              className={styles.bgImage}
            />
          </div>

          {/* Noise overlay — framer-z3ltis */}
          <div className={styles.noiseOverlay}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="auto"
              width={2848}
              height={1588}
              src={NOISE_IMG}
              alt=""
              aria-hidden="true"
              className={styles.noiseImage}
            />
          </div>

          {/* Blur overlay — framer-1w7zods */}
          <div className={styles.blurOverlay} />

          {/* Inner content — framer-165nn3j */}
          <div className={styles.innerContainer}>

            {/* LEFT — framer-1mzphu2 */}
            <div className={styles.leftCol}>

              {/* Content — framer-9niauw / framer-16geo85 */}
              <div className={styles.contentBlock}>
                <p className={styles.descriptionText}>
                  {project.description}
                </p>
              </div>

              {/* Brand — framer-1pir4kz */}
              <div className={styles.brandBlock}>

                {/* Counter row — framer-r999pn */}
                <div className={styles.dateRow}>
                  {/* framer-k15jqr */}
                  <p className={styles.dateNumber}>{project.number}</p>
                  {/* framer-1eo6faf */}
                  <p className={styles.dateSeparator}>&nbsp;/ 03</p>
                </div>

                {/* Client name h2 — framer-mtdgxz / framer-styles-preset-13pym41 */}
                <h2 className={styles.clientName}>
                  <span className={styles.clientNameSpan}>
                    {project.clientName.split("").map((char, i) => (
                      <span key={i} className={styles.clientNameChar}>
                        {char}
                      </span>
                    ))}
                  </span>
                </h2>
              </div>
            </div>

            {/* RIGHT — framer-90jchk */}
            <div className={styles.rightCol}>

              {/* Cover image link — framer-137fg67 framer-5st3ch */}
              <a
                href={project.href}
                className={styles.coverLink}
                aria-label={`View ${project.clientName} project`}
              >
                {/* Inner border highlight — framer-cy9ysw */}
                <div className={styles.coverBorder} />
                {/* Image fill — framer-1a1qf3u */}
                <div className={styles.coverImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    decoding="auto"
                    width={912}
                    height={1140}
                    sizes="(min-width: 1440px) 456px, (min-width: 810px) and (max-width: 1439.98px) 300px, (max-width: 809.98px) 300px"
                    srcSet={project.coverSrcSet}
                    src={project.coverImage}
                    alt="Cover Image"
                    className={styles.coverImage}
                  />
                </div>
              </a>

              {/* Stats panel — framer-5i263h */}
              <div className={styles.statsPanel}>

                {/* Top stats — framer-rwuc2c */}
                <div className={styles.statsTop}>
                  {/* Year — framer-1dvkm6c */}
                  <div className={styles.statBlock}>
                    {/* framer-gpmcii */}
                    <p className={styles.statLabel}>Year</p>
                    {/* framer-1ye5dlq / framer-styles-preset-13e92k5 */}
                    <p className={styles.statValue}>{project.year}</p>
                  </div>
                  {/* Role — framer-25oos7 */}
                  <div className={styles.statBlock}>
                    {/* framer-6pp3pc */}
                    <p className={styles.statLabel}>Role</p>
                    {/* framer-x4df5s */}
                    <p className={styles.statValue}>{project.role}</p>
                  </div>
                </div>

                {/* Services — framer-15okfae */}
                <div className={styles.servicesBlock}>
                  {/* framer-10fme74 */}
                  <p className={styles.servicesLabel}>Services</p>
                  {/* framer-1tfezv5 / framer-dzuyjn / framer-1ny8fgc / framer-12n5dvj */}
                  {project.services.map((srv) => (
                    <p key={srv} className={styles.serviceItem}>
                      {srv}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SelectedWorks() {
  return (
    /* framer-s0bx2r */
    <section className={styles.section} data-framer-name="Works-Section">
      {/* framer-3u9vmd */}
      <div className={styles.container} data-framer-name="Container">

        {/* framer-c6tfrg — flex-row: label left, heading right */}
        <div className={styles.top} data-framer-name="Top">
          {/* framer-1u53hr0 */}
          <p className={styles.label}>(Recent Works)</p>

          {/* framer-1raj7xj */}
          <div className={styles.headingBox} data-framer-name="Heading">
            {/* framer-1df4roe / framer-benisz */}
            {/* framer-styles-preset-nv8ngd with data-text-fill gradient */}
            <h2 className={styles.headingText}>Recent Works</h2>
          </div>
        </div>

        {/* framer-oh5ifz */}
        <div className={styles.bottom} data-framer-name="Bottom">
          {PROJECTS.map((project, index) => (
            <WorkCard
              key={project.id}
              project={project}
              isLast={index === PROJECTS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
