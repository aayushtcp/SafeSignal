"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router";
import { Radio, Users, MessageSquareText } from "lucide-react";

const capabilities = [
  {
    icon: Radio,
    title: "Instant alerts",
    copy: "Report a disaster and push live signals to people nearby before the news cycle catches up.",
    href: "/register-disaster",
    cta: "Report now",
    image:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1400&auto=format&fit=crop",
  },
  {
    icon: Users,
    title: "Community help",
    copy: "Request aid or claim open help posts so relief reaches the right place faster.",
    href: "/all-help-requests",
    cta: "Browse help",
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1400&auto=format&fit=crop",
  },
  {
    icon: MessageSquareText,
    title: "Area chat",
    copy: "Coordinate in real time with others in your zone when every minute matters.",
    href: "/area-chat/kathmandu",
    cta: "Open chat",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop",
  },
];

const HeroMoving = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(20,184,166,0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 100%, rgba(14,116,144,0.12), transparent 50%), #eef3f4",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8 text-left">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-14 md:mb-16"
        >
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase text-teal-700 mb-3"
            style={{ fontFamily: '"Syne", "Montserrat Alternates", sans-serif' }}
          >
            What SafeSignal does
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight"
            style={{ fontFamily: '"Syne", "Montserrat Alternates", sans-serif' }}
          >
            Three signals.
            <br />
            One response network.
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-xl">
            Stay ahead of floods, quakes, and fires with tools built for speed —
            not bureaucracy.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 md:gap-10">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            const reverse = index % 2 === 1;

            return (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.6,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative h-56 md:h-72 overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                </div>

                <div className={reverse ? "md:text-right" : ""}>
                  <div
                    className={`inline-flex items-center gap-2 text-teal-800 mb-3 ${
                      reverse ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    <span className="text-xs font-semibold tracking-[0.18em] uppercase">
                      0{index + 1}
                    </span>
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
                    style={{
                      fontFamily: '"Syne", "Montserrat Alternates", sans-serif',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-3 text-slate-600 text-base md:text-lg leading-relaxed max-w-md ${
                      reverse ? "md:ml-auto" : ""
                    }`}
                  >
                    {item.copy}
                  </p>
                  <Link
                    to={item.href}
                    className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 border-b border-teal-700/40 pb-0.5 hover:border-teal-800 transition-colors ${
                      reverse ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {item.cta}
                    <span aria-hidden="true">{reverse ? "←" : "→"}</span>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroMoving;
