import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useUserDetails } from "../context/UserDetailsContext";
import { API_URL } from "../context/myurl";

const TYPE_FILTERS = [
  "All",
  "Fire",
  "Flood",
  "Landslide",
  "Earthquake",
  "Tornado",
  "Hurricane",
];

const DisasterList = () => {
  const { userDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [disasters, setDisasters] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(`${API_URL}/disaster-list/`, {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        if (cancelled) return;
        if (response.data?.data) {
          setDisasters(response.data.data);
          setUser(response.data.logged_user);
        } else {
          setDisasters(Array.isArray(response.data) ? response.data : []);
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not load disaster list");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const appendVote = async (disasterId) => {
    try {
      await axios.patch(
        `${API_URL}/disaster/${disasterId}/vote/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setDisasters((prev) =>
        prev.map((d) =>
          d.id === disasterId
            ? {
                ...d,
                upvotes: (d.upvotes || 0) + 1,
                voters: d.voters ? [...d.voters, user] : [user],
              }
            : d
        )
      );
      toast.success("Vote recorded");
    } catch (error) {
      if (!localStorage.getItem("access_token")) {
        toast("Sign in to upvote", { icon: "⚠️" });
      } else if (error.response?.status === 400) {
        toast.error("You already voted for this disaster");
      } else {
        toast.error("Failed to update votes");
      }
    }
  };

  const handleTakeAction = async (disasterId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.patch(
        `${API_URL}/disaster/${disasterId}/take-action/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );
      if (response.status === 200) {
        toast.success("You are now handling this disaster");
        setDisasters((prev) =>
          prev.map((d) =>
            d.id === disasterId
              ? { ...d, handled_by: userDetails?.username || "You" }
              : d
          )
        );
      }
    } catch {
      toast.error("Disaster is already handled");
    }
  };

  const handleDelete = async (disasterId) => {
    if (!window.confirm("Delete this disaster report?")) return;
    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/disaster/${disasterId}/delete/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDisasters((prev) => prev.filter((d) => d.id !== disasterId));
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    }
  };

  const votedDisasterIds = useMemo(
    () => disasters.filter((d) => d.voters?.includes(user)).map((d) => d.id),
    [disasters, user]
  );

  const filtered = useMemo(() => {
    return disasters
      .filter((item) => {
        const type = String(item.disasterType || "");
        const matchesType =
          typeFilter === "All" ||
          type.toLowerCase() === typeFilter.toLowerCase();
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !q ||
          type.toLowerCase().includes(q) ||
          String(item.description || "")
            .toLowerCase()
            .includes(q) ||
          String(item.location || item.country || "")
            .toLowerCase()
            .includes(q);
        return matchesType && matchesSearch;
      })
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }, [disasters, searchTerm, typeFilter]);

  const isOrg = userDetails?.user_type === "Organization";

  return (
    <>
      <Toaster position="top-center" />
      <Navigation />

      <main className="bg-[#e6e9ec] text-[#121417] min-h-screen">
        <header className="max-w-5xl mx-auto px-5 md:px-8 pt-8 md:pt-10 pb-4">
          <p
            className="text-[2.4rem] sm:text-5xl md:text-6xl font-extrabold leading-[0.9] tracking-tight text-[#121417]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            SafeSignal
          </p>
          <h1
            className="mt-2 text-xl md:text-2xl font-medium text-[#2a3038] max-w-md"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Disaster board
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-snug text-[#3d4450]">
            Reports from people on the ground. Vote if you can confirm; open
            anything that needs your eyes.
          </p>
        </header>

        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#121417]/20 pb-4 mb-2">
            <label className="flex-1 block">
              <span className="sr-only">Search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find a place or type…"
                className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-[#121417] outline-none py-2 text-lg placeholder:text-[#7a8290]"
              />
            </label>
            <div className="flex items-center gap-4 text-sm shrink-0 pb-2">
              {user ? (
                <span className="text-[#4a5260]">Hi, {user}</span>
              ) : (
                <Link to="/login" className="underline underline-offset-4">
                  Sign in to vote
                </Link>
              )}
              <Link
                to="/register-disaster"
                className="bg-[#d6452f] text-white px-4 py-2 font-semibold hover:bg-[#b93825] transition-colors"
              >
                Report
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 py-4 text-sm">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={
                  typeFilter === t
                    ? "font-bold text-[#d6452f] underline underline-offset-4"
                    : "text-[#4a5260] hover:text-[#121417]"
                }
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="py-16 text-[#4a5260]">Loading reports…</p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-[#4a5260]">
              Nothing here yet.{" "}
              <Link to="/register-disaster" className="underline">
                File a report
              </Link>
              .
            </p>
          ) : (
            <ol className="divide-y divide-[#121417]/12">
              {filtered.map((item, index) => {
                const hasVoted = votedDisasterIds.includes(item.id);
                const type = item.disasterType || "Alert";
                const reporter =
                  item.triggeredBy_username || item.triggeredBy || "Anonymous";
                const place =
                  item.location || item.country || "Unknown location";

                return (
                  <li
                    key={item.id ?? index}
                    className="py-7 grid grid-cols-[3rem_1fr] sm:grid-cols-[4.5rem_1fr_auto] gap-x-4 gap-y-3"
                  >
                    <span
                      className="text-3xl sm:text-4xl font-bold text-[#d6452f]/75 leading-none pt-1 tabular-nums"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2
                          className="text-2xl md:text-[1.65rem] font-bold tracking-tight"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {type}
                        </h2>
                        <span className="text-sm text-[#4a5260]">{place}</span>
                      </div>
                      <p className="mt-2 text-[15px] leading-relaxed text-[#1f2430] max-w-2xl">
                        {item.description || "No description provided."}
                      </p>
                      <p className="mt-3 text-xs text-[#6a7280]">
                        by {reporter}
                        {item.handled_by
                          ? ` · handled by ${item.handled_by}`
                          : ""}
                        {userDetails?.username === reporter && (
                          <>
                            {" · "}
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="underline text-[#d6452f]"
                            >
                              delete
                            </button>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 sm:pt-1">
                      <span className="text-sm tabular-nums text-[#4a5260]">
                        {item.upvotes || 0} votes
                      </span>
                      <button
                        type="button"
                        disabled={hasVoted}
                        onClick={() => appendVote(item.id)}
                        className="text-sm font-semibold underline underline-offset-4 disabled:no-underline disabled:opacity-40"
                      >
                        {hasVoted ? "Voted" : "Upvote"}
                      </button>
                      {isOrg && !item.handled_by && (
                        <button
                          type="button"
                          onClick={() => handleTakeAction(item.id)}
                          className="text-sm underline underline-offset-4"
                        >
                          Take action
                        </button>
                      )}
                      <Link
                        to={`/disaster-detail/${item.id}`}
                        className="text-sm font-semibold bg-[#121417] text-[#e6e9ec] px-3 py-1.5 hover:bg-[#d6452f] transition-colors"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export { DisasterList };
