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
  ThumbsUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDisasters } from "../context/DisastersContext";

// Add props to receive the appendVote function and votedDisasters from parent
const GeneralCards = ({ appendVote, votedDisasters = [] }) => {
  const { disastersbycontext } = useDisasters();
  const [allDisasters, setAllDisasters] = useState([]);
  const [upvotedDisasters, setUpvotedDisasters] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (disastersbycontext && disastersbycontext.data) {
      setAllDisasters(disastersbycontext.data);
    }
  }, [disastersbycontext]);

  console.log("The data is: ", allDisasters);

  // Function to determine background color and icon based on disaster type
  const getDisasterDetails = (disasterType) => {
    if (!disasterType)
      return {
        bgcolor: "bg-gray-400",
        icon: <FlameKindling className="w-10 h-10 text-gray-700" />,
        bgImage:
          "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000&auto=format&fit=crop')",
      };

    switch (disasterType.toLowerCase()) {
      case "flood":
        return {
          bgcolor: "bg-blue-400",
          icon: <Droplets className="w-10 h-10 text-blue-700" />,
          bgImage:
            "url('https://images.unsplash.com/photo-1485617359743-4dc5d2e53c89?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        };
      case "fire":
        return {
          bgcolor: "bg-red-400",
          icon: <FlameKindling className="w-10 h-10 text-red-700" />,
          bgImage:
            "url('/cosmos.png')",
            // "url('https://images.unsplash.com/photo-1517594422361-5eeb8ae275a9?q=80&w=1000&auto=format&fit=crop')",
        };
      case "landslide":
        return {
          bgcolor: "bg-green-400",
          icon: <Mountain className="w-10 h-10 text-green-700" />,
          bgImage:
            "url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop')",
        };
      case "earthquake":
        return {
          bgcolor: "bg-orange-400",
          icon: <Activity className="w-10 h-10 text-orange-700" />,
          bgImage:
            "url('https://images.unsplash.com/photo-1584314490734-6a1c3e47341d?q=80&w=1000&auto=format&fit=crop')",
        };
      case "hurricane":
      case "tornado":
        return {
          bgcolor: "bg-cyan-400",
          icon: <Wind className="w-10 h-10 text-cyan-700" />,
          bgImage:
            "url('https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1000&auto=format&fit=crop')",
        };
      default:
        return {
          bgcolor: "bg-gray-400",
          icon: <AlertTriangle className="w-10 h-10 text-gray-700" />,
          bgImage:
            "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000&auto=format&fit=crop')",
        };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
    hover: {
      y: -8,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
      },
    },
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 300,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 300,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {allDisasters.map((item, index) => {
        // Check if this disaster has been voted on
        const hasVoted = votedDisasters.includes(item.id);
        const disasterDetails = getDisasterDetails(item.disasterType);

        return (
          <motion.div
            key={index}
            className="w-full rounded-3xl overflow-hidden shadow-xl"
            variants={cardVariants}
            whileHover="hover"
          >
            {/* Top section with cosmic background */}
            <div
              className="h-[180px] w-full bg-cover bg-center relative bg-[url(/cosmos.png)]"
              // style={{
              //   backgroundImage: disasterDetails.bgImage,
              // }}
            >
              {/* Title centered */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                variants={iconVariants}
              >
                <h3 className="text-xl text-white font-bold font-sans">
                  {/* {item.disasterType.toUpperCase()} */}
                  {item.disasterType.charAt(0).toUpperCase() + item.disasterType.slice(1).toLowerCase()}
                </h3>
              </motion.div>

              {/* Curved bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-[20px] bg-white rounded-t-[8px]"></div>

              {/* Upvote counter */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <ThumbsUp className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {item.upvotes || 0}
                </span>
              </div>
            </div>

            {/* Content section */}
            <div className="flex items-center justify-center">
              {disasterDetails.icon}
            </div>
            <div className="px-6 pb-8 pt-4">
              <h4 className="text-center font-bold">
                {item.disasterType.charAt(0).toUpperCase() + item.disasterType.slice(1).toLowerCase()}
              </h4>
              <p className="text-center text-sm mb-6 px-4 text-slate-700 h-[60px] overflow-hidden">
                {item.description.length > 100
                  ? item.description.slice(0, 89) + "..."
                  : item.description}
              </p>
              

              <div className="flex justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  {/* <MapPin className="w-5 h-5 text-purple-400" /> */}
                  <p className="text-2xl">📌</p>
                  <span className="text-xs text-slate-700">
                    {item.location || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* <User className="w-5 h-5 text-purple-400" /> */}
                  <p className="text-2xl">🧑🏻‍🦰</p>
                  <span className="text-xs text-slate-700">
                    {item.triggeredBy_username || "Anonymous"}
                  </span>
                </div>
              </div>

              <motion.button
                className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-white font-medium"
                variants={buttonVariants}
                whileHover={!hasVoted ? "hover" : undefined}
                whileTap={!hasVoted ? "tap" : undefined}
                onClick={() => appendVote(item.id)}
                disabled={hasVoted}
                style={{
                  backgroundColor: hasVoted ? "#9CA3AF" : "#6949ff",
                  cursor: hasVoted ? "not-allowed" : "pointer",
                }}
              >
                <ThumbsUp className="w-5 h-5" />
                {hasVoted ? "Voted" : "UpVote"}
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default GeneralCards;