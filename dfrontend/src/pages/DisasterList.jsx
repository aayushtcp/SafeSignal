import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "../styles/DisasterList.css";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
// import { useDisasters } from "../context/DisastersContext";
import GeneralCards from "../components/GeneralCards";
import { useUsername } from "../context/UsernameContext";
import { API_URL } from "../context/myurl";
import { UserDetailsProvider } from "../context/UserDetailsContext";

const DisasterList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState(0);
  const [disasters, setDisasters] = useState([]);
  const [alreadyVoters, setAlreadyVoters] = useState([]);
  const [user, setUser] = useState();
  const [mapSrc, setMapSrc] = useState("");
  // const { disasters2 } = useDisasters();
  const username = useUsername();
  useEffect(() => {
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

        if (response.data.data) {
          // When logged in
          setDisasters(response.data.data);
          setUser(response.data.logged_user);
        } else {
          // When not logged in
          setDisasters(response.data);
        }
      } catch (e) {
        console.log("Something went wrong!", e);
        setError("Error in Fetching Disaster List");
        toast.error("Error in Fetching Disaster List");
      } finally {
        setLoading(false);
      }
    })();
  }, [votes]);

  // To append the vote
  const appendVote = async (disasterId) => {
    setError("");
    try {
      const response = await axios.patch(
        `${API_URL}/disaster/${disasterId}/vote/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // Update the upvotes and voters immediately for the voted disaster
      setDisasters((prevDisasters) =>
        prevDisasters.map((d) =>
          d.id === disasterId
        ? {
            ...d,
            upvotes: (d.upvotes || 0) + 1,
            voters: d.voters ? [...d.voters, user] : [user],
          }
        : d
        )
      );
      // Optionally update alreadyVoters
      setAlreadyVoters((prev) =>
        prev.includes(user) ? prev : [...prev, user]
      );

      toast.success("Vote recorded successfully!");

      setVotes((prev) => prev + 1);
    } catch (error) {
      if (!localStorage.getItem("access_token")) {
        setError("User is not Logged in");
        // toast.error("Sign up and Login Required for vote");
        toast("Sign up and Login Required for vote", {
          icon: "⚠️",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      } else if (error.response && error.response.status === 400) {
        setError("You have already voted for this disaster.");
        toast.error("You have already voted for this disaster.");
        const extractedUsernames = error.response.data.alreadyvoters.map(
          (user) => user.username
        );
        setAlreadyVoters(extractedUsernames);
      } else {
        setError("Failed to update votes.");
        toast.error("Failed to update votes.");
      }
    }
  };

  // Get the list of disaster IDs that the current user has voted for
  const votedDisasterIds = disasters
  .filter((disaster) => disaster.voters?.includes(user))
  .map((disaster) => disaster.id);
  
  return (
    <>
      <Toaster />
      <Navigation />

      {/* Loading indicator */}
      {loading && (
        <div className="loading-container">
          <div className="loading-indicator">Loading disasters...</div>
        </div>
      )}

      {/* Cards Section - Now at the top */}
      <div className="cards-section">
        <h3 className="font-bold text-2xl text-center">
          Disaster <span className="text-purple-700">List</span>{" "}
        </h3>
        {/* Pass the appendVote function and votedDisasterIds to GeneralCards */}
        {/* <UserDetailsProvider> */}
          <GeneralCards
            disasters={disasters}
            appendVote={appendVote}
            votedDisasters={votedDisasterIds}
          />
        {/* </UserDetailsProvider> */}
      </div>

      <div className="relative bg-purple-600 min-h-[60vh] flex items-center overflow-hidden">
        {/* Background circles - more precise positioning to match figure */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[90vh] h-[90vh] rounded-full bg-purple-500/30"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[70vh] h-[70vh] rounded-full bg-purple-400/30"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[50vh] h-[50vh] rounded-full bg-purple-300/30"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[30vh] h-[30vh] rounded-full bg-purple-200/30"></div>
        </div>

        {/* Content - adjusted to match figure layout */}
        <div className="relative z-10 container mx-auto px-8 py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Disaster Tracker
            </h1>
            <p className="text-white text-xl md:text-2xl mb-10 max-w-2xl">
              Stay informed about disasters worldwide and help by upvoting to
              increase awareness.
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-10">
              <div className="p-5 bg-white/20 backdrop-blur-md rounded-lg shadow-lg">
                <span className="text-3xl md:text-5xl font-semibold text-white">
                  {disasters.length}
                </span>
                <p className="text-sm md:text-base text-white mt-2">
                  Disasters Tracked
                </p>
              </div>
              <div className="p-5 bg-white/20 backdrop-blur-md rounded-lg shadow-lg">
                <span className="text-3xl md:text-5xl font-semibold text-white">
                  {disasters.reduce(
                    (sum, disaster) => sum + (disaster.upvotes || 0),
                    0
                  )}
                </span>
                <p className="text-sm md:text-base text-white mt-2">
                  Total Votes
                </p>
              </div>
              <div className="p-5 bg-white/20 backdrop-blur-md rounded-lg shadow-lg">
                <span className="text-3xl md:text-5xl font-semibold text-white">
                  {alreadyVoters.length}
                </span>
                <p className="text-sm md:text-base text-white mt-2">
                  Active Voters
                </p>
              </div>
            </div>

            {/* User Section - styled to match figure buttons */}
            {user ? (
              <div className="mt-6 text-lg font-semibold">
                <span className="px-6 py-3 bg-green-500 rounded-full shadow-md text-white inline-block">
                  Welcome, {user}!
                </span>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-xl text-white mb-4">
                  Sign in to upvote disasters and help spread awareness
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-between bg-black text-white px-8 py-4 rounded-full hover:bg-black/80 transition-colors shadow-lg"
                >
                  <span>Sign In</span>
                  <span className="ml-3 w-5 h-5 bg-white rounded-full"></span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export { DisasterList };
