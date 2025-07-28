"use client";

import {
  FlameKindling,
  Droplets,
  Mountain,
  Activity,
  Wind,
  AlertTriangle,
  MapPin,
  User,
  Info,
  ThumbsUp,
} from "lucide-react";
import { FaFlagCheckered } from "react-icons/fa";
import { MdAddReaction } from "react-icons/md";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDisasters } from "../context/DisastersContext";
import toast from "react-hot-toast";
import { useUserDetails } from "../context/UserDetailsContext";
import axios from "axios";
import { API_URL } from "../context/myurl";
import { Link } from "react-router-dom";

const GeneralCards = ({ appendVote, votedDisasters = [] }) => {
  const { userDetails } = useUserDetails();
  const { disastersbycontext } = useDisasters();
  const [userType, setUserType] = useState(null);

  const [allDisasters, setAllDisasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Search state

  const [flaggedDisasters, setFlaggedDisasters] = useState([]);

  const handleFlag = async (disasterId) => {
    if (flaggedDisasters.includes(disasterId)) {
      toast.error("You have already flagged this disaster.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `${API_URL}/disaster/${disasterId}/flag/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      if (response.status === 200) {
        toast.success("Disaster reported successfully!");
        setFlaggedDisasters((prev) => [...prev, disasterId]);
        // Update the flag_count for the flagged disaster
        setAllDisasters((prevDisasters) =>
          prevDisasters.map((disaster) =>
            disaster.id === disasterId
              ? { ...disaster, flag_count: (disaster.flag_count || 0) + 1 }
              : disaster
          )
        );
      }
    } catch (error) {
      console.error("Error flagging disaster:", error);
      toast.error(error?.response?.data?.detail || "Error flagging disaster");
      if (error.response && error.response.status === 403) {
        toast.error("You are not allowed to flag this disaster.");
      }
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      if (disastersbycontext.data?.length) {
        setAllDisasters(disastersbycontext.data);
      }
    } else {
      // Public users (no login)
      if (disastersbycontext.data?.length) {
        setAllDisasters(disastersbycontext.data);
      }
    }
  }, [disastersbycontext.data]);

  useEffect(() => {
    if (userDetails) {
      setUserType(userDetails.user_type);
    }
  }, [userDetails]);

  // Function to handle the action when the button is clicked
  async function handleTakeAction(disasterId) {
    console.log("Take action clicked:", disasterId);
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
        toast.success("Now you can take action on this disaster!");
        setAllDisasters((prevDisasters) =>
          prevDisasters.map((disaster) =>
            disaster.id === disasterId
              ? { ...disaster, handled_by: userDetails?.handled_by || "You" }
              : disaster
          )
        );
      }
    } catch (error) {
      console.error("Error handling action:", error);
      toast.error("Disaster is already handled");
    }
  }

  const accentColors = {
    flood: { text: "text-blue-600", icon: "text-blue-400" },
    fire: { text: "text-red-600", icon: "text-red-400" },
    landslide: { text: "text-green-600", icon: "text-green-400" },
    earthquake: { text: "text-orange-600", icon: "text-orange-400" },
    hurricane: { text: "text-slate-600", icon: "text-slate-400" },
    tornado: { text: "text-slate-600", icon: "text-slate-400" },
    default: { text: "text-gray-600", icon: "text-gray-400" },
  };

  const borderColors = [
    "border-l-4 border-green-500",
    "border-l-4 border-purple-500",
    "border-l-4 border-amber-500",
  ];

  const getDisasterDetails = (disasterType) => {
    const type = disasterType?.toLowerCase();
    switch (type) {
      case "flood":
        return {
          icon: <Droplets className="w-5 h-5" />,
          colors: accentColors.flood,
        };
      case "fire":
        return {
          icon: <FlameKindling className="w-5 h-5" />,
          colors: accentColors.fire,
        };
      case "landslide":
        return {
          icon: <Mountain className="w-5 h-5" />,
          colors: accentColors.landslide,
        };
      case "earthquake":
        return {
          icon: <Activity className="w-5 h-5" />,
          colors: accentColors.earthquake,
        };
      case "hurricane":
      case "tornado":
        return {
          icon: <Wind className="w-5 h-5" />,
          colors: accentColors.hurricane,
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          colors: accentColors.default,
        };
    }
  };

  // Filter disasters by search term
  const filteredDisasters = allDisasters.filter((item) =>
    item.disasterType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search input */}
      <div className="px-4 md:px-8 pt-6 md:pt-8 pb-2 flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
        <h3 className="font-bold text-indigo-900 opacity-70 text-xl md:text-2xl">
          Search for disasters:
        </h3>
        <div className="relative w-full md:w-1/2">
          <label htmlFor="disaster-search" className="sr-only">
            Search disaster type
          </label>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="disaster-search"
            type="text"
            placeholder="Search disaster type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {filteredDisasters.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-16">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <span className="text-lg font-medium">No disasters found</span>
          </div>
        )}
        {filteredDisasters.map((item) => {
          const hasVoted = votedDisasters.includes(item.id);
          const { icon, colors } = getDisasterDetails(item.disasterType);
          const randomBorderColor =
            borderColors[Math.floor(Math.random() * borderColors.length)];

          return (
            <motion.div
              key={item.id}
              className={`flex flex-col justify-between h-72 bg-slate-100 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition p-7 ${randomBorderColor} relative overflow-hidden`}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Accent icon background */}
              <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none">
                <div className="text-8xl">{icon}</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full bg-gray-100 p-2 shadow-sm ${colors.icon}`}
                  >
                    {icon}
                  </div>
                  <h4
                    className={`text-lg font-bold tracking-tight ${colors.text}`}
                  >
                    {item.disasterType?.charAt(0).toUpperCase() +
                      item.disasterType?.slice(1)}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <User className="w-4 h-4" />
                  <span className="font-medium">
                    {item.triggeredBy || "Anonymous"}
                  </span>

                  {userDetails?.username === item.triggeredBy && (
                    <button
                      className="ml-2 text-red-600 hover:underline text-xs"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this report?"
                          )
                        ) {
                          try {
                            const accessToken = localStorage.getItem("access_token");
                            await axios.delete(
                              `${API_URL}/disaster/${item.id}/delete/`,
                              {
                                headers: {
                                  Authorization: `Bearer ${accessToken}`,
                                },
                              }
                            );
                            // Remove the deleted item from state
                            setAllDisasters((prev) => prev.filter((d) => d.id !== item.id));
                            toast.success("Disaster report deleted.");
                          } catch (err) {
                            alert("Failed to delete disaster report.");
                          }
                        }
                      }}
                      title="Delete this report"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <p className="text-base text-gray-600 line-clamp-3 flex-1 mb-6">
                {item.description}
              </p>

              <div className="flex gap-4 justify-between items-center">
                <div className="btn-grup flex gap-3">
                  <motion.button
                    onClick={() => appendVote(item.id)}
                    disabled={hasVoted}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all
                    ${
                      hasVoted
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {hasVoted ? "Voted" : `Upvote-${item.upvotes}`}
                  </motion.button>

                  <Link
                    to={`/disaster-detail/${item.id}`}
                    className="flex items-center gap-2 bg-amber-500 text-white hover:bg-amber-600 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
                  >
                    <Info className="w-5 h-5" />
                    Details
                  </Link>

                  {/* Take action only user is organization */}
                  {userType === "Organization" && (
                    <motion.button
                      onClick={() => handleTakeAction(item.id)}
                      disabled={!!item.handled_by}
                      className={
                        item.handled_by
                          ? `flex items-center gap-2 bg-green-500 cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm`
                          : `flex items-center gap-2 bg-gray-400 text-white hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm`
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      <MdAddReaction className="w-5 h-5" />
                      {item.handled_by
                        ? `Handled by ${item.handled_by}`
                        : "Take Action"}
                    </motion.button>
                  )}
                  {/* <p className="h-full px-4 py-2 rounded-lg bg-red-500">xn</p> */}
                </div>

                <div className="flex items-center gap-5 text-gray-400 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">
                      {item.country || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <button
                      className="cursor-pointer transition"
                      onClick={(e) => handleFlag(item.id)}
                    >
                      <i className="text-red-500 hover:text-green-500 transition-ease text-3xl">
                        <FaFlagCheckered />
                      </i>
                      <p className="font-bold text-red-600">
                        {item.flag_count}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
};

export default GeneralCards;
