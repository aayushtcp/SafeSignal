import { useEffect, useMemo, useState } from "react";
import Footer from "../../components/Footer";
import Navigation from "../../components/Navigation";
import { useHelp } from "../../context/HelpsContext";
import { Link } from "react-router-dom";

const TYPE_FILTERS = ["All", "Money", "Food", "Both"];

export default function HelpRequestsList() {
  const { helpsbycontext } = useHelp();
  const [helps, setHelps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    if (helpsbycontext) setHelps(helpsbycontext);
  }, [helpsbycontext]);

  const approved = useMemo(
    () => helps.filter((help) => help.approve !== false),
    [helps]
  );

  const filtered = useMemo(() => {
    return approved.filter((help) => {
      const matchesType =
        typeFilter === "All" || help.help_type === typeFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(help.requester_name || "")
          .toLowerCase()
          .includes(q) ||
        String(help.verified_by || "")
          .toLowerCase()
          .includes(q) ||
        String(help.help_type || "")
          .toLowerCase()
          .includes(q);
      return matchesType && matchesSearch;
    });
  }, [approved, searchTerm, typeFilter]);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#1c2a24] text-[#e8e2d6]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-6 md:pb-8">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-14 items-end">
            <div>
              <p
                className="text-5xl md:text-7xl font-extrabold leading-[0.9] tracking-tight text-[#e8e2d6]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                SafeSignal
              </p>
              <h1
                className="mt-4 text-2xl md:text-3xl font-semibold text-[#b8c9b4]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Who needs help
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#9aab96]">
                Approved asks for food, money, or both. If you can deliver,
                open a request and claim it.
              </p>
            </div>

            <div className="relative h-48 md:h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover grayscale-[20%] contrast-110"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-end gap-4 border-b border-[#e8e2d6]/25 pb-4">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search a name…"
              className="flex-1 bg-transparent border-0 outline-none py-2 text-lg placeholder:text-[#6f7f6b]"
            />
            <Link
              to="/request-help"
              className="shrink-0 self-start sm:self-auto bg-[#e8e2d6] text-[#1c2a24] px-4 py-2 font-semibold hover:bg-white transition-colors"
            >
              Ask for help
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 py-4 text-sm">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={
                  typeFilter === t
                    ? "font-bold text-[#f0c674] underline underline-offset-4"
                    : "text-[#8a9a86] hover:text-[#e8e2d6]"
                }
              >
                {t}
              </button>
            ))}
            <span className="ml-auto text-[#6f7f6b] tabular-nums">
              {filtered.length} shown
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
          {filtered.length === 0 ? (
            <p className="py-16 text-[#8a9a86]">
              No open requests.{" "}
              <Link to="/request-help" className="underline text-[#e8e2d6]">
                Post one
              </Link>
              .
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              {filtered.map((help, index) => {
                const image =
                  help.image1 ||
                  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop";
                const odd = index % 2 === 1;

                return (
                  <article
                    key={help.id || index}
                    className={`group flex flex-col bg-[#24352d] ${
                      odd ? "sm:translate-y-6" : ""
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      <p className="text-sm text-[#f0c674]">
                        {help.help_type || "Aid"}
                      </p>
                      <h2
                        className="mt-2 text-2xl font-bold leading-tight"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        {help.requester_name || "Anonymous"}
                      </h2>
                      <p className="mt-3 text-sm text-[#9aab96] leading-snug">
                        Verified by {help.verified_by || "N/A"}
                        {help.verification_date
                          ? ` on ${help.verification_date}`
                          : ""}
                      </p>
                      <Link
                        to={`/help-request/${help.id}`}
                        className="mt-6 inline-flex self-start text-sm font-semibold border-b border-[#e8e2d6]/50 pb-0.5 hover:border-[#f0c674] hover:text-[#f0c674] transition-colors"
                      >
                        Read the request →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
