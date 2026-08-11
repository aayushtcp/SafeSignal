"use client";

import {
  FlameKindling,
  Droplets,
  Mountain,
  Activity,
  Wind,
  AlertTriangle,
  MapPin,
  ArrowUpRight,
  ThumbsUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "react-router";
import { useDisasters } from "../context/DisastersContext";

const typeMeta = {
  flood: {
    label: "Flood",
    icon: Droplets,
    tone: "text-cyan-800 bg-cyan-100",
    bar: "bg-cyan-600",
  },
  fire: {
    label: "Fire",
    icon: FlameKindling,
    tone: "text-rose-800 bg-rose-100",
    bar: "bg-rose-600",
  },
  landslide: {
    label: "Landslide",
    icon: Mountain,
    tone: "text-lime-900 bg-lime-100",
    bar: "bg-lime-700",
  },
  earthquake: {
    label: "Earthquake",
    icon: Activity,
    tone: "text-orange-900 bg-orange-100",
    bar: "bg-orange-600",
  },
  hurricane: {
    label: "Hurricane",
    icon: Wind,
    tone: "text-sky-900 bg-sky-100",
    bar: "bg-sky-600",
  },
  tornado: {
    label: "Tornado",
    icon: Wind,
    tone: "text-sky-900 bg-sky-100",
    bar: "bg-sky-600",
  },
};

function normalizeDisasters(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function getMeta(type) {
  const key = String(type || "").toLowerCase();
  return (
    typeMeta[key] || {
      label: type || "Alert",
      icon: AlertTriangle,
      tone: "text-slate-800 bg-slate-200",
      bar: "bg-slate-600",
    }
  );
}

const GeneralCards2 = ({ appendVote, votedDisasters = [] }) => {
  const { disastersbycontext } = useDisasters();
  const reduceMotion = useReducedMotion();

  const disasters = useMemo(() => {
    const list = normalizeDisasters(disastersbycontext);
    return [...list]
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 6);
  }, [disastersbycontext]);

  return (
    <section
      className="relative py-20 md:py-28"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(20,184,166,0.1), transparent 50%), #f7faf9",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8 text-left">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              className="text-sm font-semibold tracking-[0.2em] uppercase text-teal-700 mb-3"
              style={{
                fontFamily: '"Syne", "Montserrat Alternates", sans-serif',
              }}
            >
              Live feed
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]"
              style={{
                fontFamily: '"Syne", "Montserrat Alternates", sans-serif',
              }}
            >
              Recent disaster signals
            </h2>
            <p className="mt-3 text-slate-600 max-w-lg text-base md:text-lg">
              Community-reported events ranked by signal strength.
            </p>
          </div>
          <Link
            to="/disaster-list"
            className="inline-flex items-center gap-2 self-start sm:self-auto text-sm font-semibold text-teal-800 border-b border-teal-700/40 pb-0.5 hover:border-teal-900 transition-colors"
          >
            View all disasters
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {disasters.length === 0 ? (
          <div className="border border-dashed border-slate-300 px-6 py-16 text-center text-slate-500">
            No active signals yet. Be the first to{" "}
            <Link
              to="/register-disaster"
              className="font-semibold text-teal-800 underline-offset-2 hover:underline"
            >
              report a disaster
            </Link>
            .
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-200 border-y border-slate-200">
            {disasters.map((item, index) => {
              const meta = getMeta(item.disasterType);
              const Icon = meta.icon;
              const hasVoted = votedDisasters.includes(item.id);
              const description = String(item.description || "");
              const truncated =
                description.length > 120
                  ? `${description.slice(0, 117)}...`
                  : description;

              return (
                <motion.li
                  key={item.id ?? index}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative"
                >
                  <div
                    className={`absolute left-0 top-0 h-full w-1 opacity-0 transition-opacity group-hover:opacity-100 ${meta.bar}`}
                  />
                  <div className="flex flex-col gap-4 py-6 pl-3 pr-1 sm:flex-row sm:items-center sm:gap-6 md:pl-4">
                    <div
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center ${meta.tone}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3
                          className="text-lg md:text-xl font-bold text-slate-900 tracking-tight"
                          style={{
                            fontFamily:
                              '"Syne", "Montserrat Alternates", sans-serif',
                          }}
                        >
                          {meta.label}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location || item.country || "Unknown location"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm md:text-base text-slate-600 leading-relaxed">
                        {truncated || "No description provided."}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Reported by{" "}
                        {item.triggeredBy_username || "Anonymous"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                      <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <ThumbsUp className="h-4 w-4" />
                        {item.upvotes || 0}
                      </div>

                      <div className="flex items-center gap-2">
                        {typeof appendVote === "function" && (
                          <button
                            type="button"
                            disabled={hasVoted}
                            onClick={() => appendVote(item.id)}
                            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-teal-700 hover:text-teal-800 transition-colors"
                          >
                            {hasVoted ? "Voted" : "Upvote"}
                          </button>
                        )}
                        <Link
                          to={`/disaster-detail/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-teal-800 transition-colors"
                        >
                          Open
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default GeneralCards2;
