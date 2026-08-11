"use client";

import { useTransform, motion, useScroll, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const guides = [
  {
    title: "Fire",
    description:
      "Cut power to affected circuits, keep low under smoke, and never re-enter until crews clear the structure.",
    tip: "Keep a damp cloth over your mouth when exiting.",
    image:
      "https://images.unsplash.com/photo-1504610926078-a1611febcad3?q=80&w=1200&auto=format&fit=crop",
    accent: "#c2410c",
  },
  {
    title: "Landslide",
    description:
      "Move uphill and away from the slide path. Watch for cracked roads, tilted trees, and sudden water flow.",
    tip: "Avoid river valleys during prolonged rain.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    accent: "#3f6212",
  },
  {
    title: "Earthquake",
    description:
      "Drop, cover, and hold on. Stay clear of windows and exterior walls until shaking fully stops.",
    tip: "Expect aftershocks — keep shoes and a light nearby.",
    image:
      "https://images.unsplash.com/photo-1584314490734-6a1c3e47341d?q=80&w=1200&auto=format&fit=crop",
    accent: "#9a3412",
  },
  {
    title: "Flood",
    description:
      "Seek higher ground early. Never drive through standing water — depth and current are easy to misjudge.",
    tip: "Six inches of moving water can knock an adult down.",
    image:
      "https://images.unsplash.com/photo-1485617359743-4dc5d2e53c89?q=80&w=1200&auto=format&fit=crop",
    accent: "#0e7490",
  },
  {
    title: "Storm",
    description:
      "Shelter in an interior room on the lowest floor. Stay away from glass and unsecured outdoor structures.",
    tip: "Charge devices before winds arrive.",
    image:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1200&auto=format&fit=crop",
    accent: "#155e75",
  },
];

export default function ScrollCards() {
  const container = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });
  const introOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.35]);

  return (
    <section
      ref={container}
      className="relative"
      style={{
        background:
          "linear-gradient(180deg, #0a1628 0%, #0f2744 45%, #0a1628 100%)",
      }}
    >
      <div className="sticky top-0 z-10 flex h-[42vh] items-end px-4 pb-10 md:px-8 md:pb-14 pointer-events-none">
        <motion.div
          className="mx-auto w-full max-w-6xl text-left"
          style={{ opacity: introOpacity }}
        >
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase text-teal-300/90 mb-3"
            style={{ fontFamily: '"Syne", "Montserrat Alternates", sans-serif' }}
          >
            Field guide
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] max-w-xl"
            style={{ fontFamily: '"Syne", "Montserrat Alternates", sans-serif' }}
          >
            Safety recommendations
          </h2>
          <p className="mt-3 max-w-lg text-slate-300 text-base md:text-lg">
            Short, actionable steps for the disasters SafeSignal tracks most.
          </p>
        </motion.div>
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4 pb-24 md:px-8 md:pb-32">
        {guides.map((guide, i) => {
          const targetScale = 1 - (guides.length - i) * 0.04;
          return (
            <GuideCard
              key={guide.title}
              guide={guide}
              index={i}
              progress={scrollYProgress}
              range={[i * 0.18, 1]}
              targetScale={reduceMotion ? 1 : targetScale}
              reduceMotion={reduceMotion}
            />
          );
        })}
      </div>
    </section>
  );
}

function GuideCard({ guide, index, progress, range, targetScale, reduceMotion }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, 0]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={ref}
      className="sticky top-[18vh] mb-6 flex h-[70vh] items-start justify-center md:top-[22vh]"
    >
      <motion.article
        style={{
          scale,
          top: `calc(${index * 14}px)`,
          borderColor: `${guide.accent}55`,
        }}
        className="relative flex h-[min(520px,62vh)] w-full origin-top overflow-hidden border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      >
        <div
          className="absolute left-0 top-0 h-full w-1.5"
          style={{ backgroundColor: guide.accent }}
        />

        <div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center p-7 md:p-10 text-left">
            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase mb-3"
              style={{ color: guide.accent }}
            >
              Guide {String(index + 1).padStart(2, "0")}
            </span>
            <h3
              className="text-3xl md:text-4xl font-bold text-white tracking-tight"
              style={{
                fontFamily: '"Syne", "Montserrat Alternates", sans-serif',
              }}
            >
              {guide.title}
            </h3>
            <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed">
              {guide.description}
            </p>
            <p className="mt-5 text-sm text-teal-200/90 border-l-2 border-teal-400/50 pl-3">
              {guide.tip}
            </p>
          </div>

          <div className="relative hidden md:block overflow-hidden">
            <motion.img
              src={guide.image}
              alt=""
              className="absolute inset-0 h-[120%] w-full object-cover"
              style={{ y: imageY }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950/40" />
          </div>
        </div>
      </motion.article>
    </div>
  );
}
