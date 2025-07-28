"use client";

import { motion } from "framer-motion";

const HeroMoving = () => {
  const blurstyle = {
    background: "rgba(255, 255, 255, 0.35)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    // borderRadius: "15px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  };

  return (
    <div className="main w-full h-max flex flex-col items-center justify-center gap-12 overflow-hidden mt-12">
      {/* First motion div - moving left */}
      <motion.div
        className="relative flex gap-8 h-100 w-max"
        initial={{ x: "100vw" }}
        animate={{ x: "-100vw" }}
        transition={{
          x: { repeat: Number.POSITIVE_INFINITY, duration: 30, ease: "linear" },
        }}
      >
        <div className="item1 h-[100%] w-[80vw] rounded-md bg-gradient-to-r from-purple-500 via-pink-600 to-red-500 border-8 border-purple-400">
          <div className="w-full h-full  p-8 flex flex-col items-center justify-center text-white" style={blurstyle}>
            <h1 className="text-4xl font-extrabold drop-shadow-lg">Welcome to SafeSignal</h1>
            <p className="text-center mt-4 text-lg">
              Your trusted platform for disaster alerts and safety signals. Stay informed and stay safe.
            </p>
          </div>
        </div>
        <div className="item1 h-[100%] w-[80vw] bg-gradient-to-r from-blue-500 via-green-600 to-teal-500 border-8 border-purple-400">
          <div className="w-full h-full p-8 flex flex-col items-center justify-center text-white" style={blurstyle}>
            <img
              className="w-24 h-24 mb-6 drop-shadow-lg"
              src="https://upload.wikimedia.org/wikipedia/commons/7/7f/Rotating_earth_animated_transparent.gif?20201022124448"
              alt="Earth"
            />
            <p className="text-center text-lg">
              Real-time updates and alerts to keep you prepared for any natural disaster.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Second motion div - moving right */}
      <motion.div
        className="more-details flex gap-8 h-100 w-max mb-6"
        initial={{ x: "-100vw" }}
        animate={{ x: "100vw" }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 30,
          ease: "linear",
          delay: 0.5,
        }}
      >
        <div className="item1 h-[100%] w-[80vw] bg-gradient-to-r from-yellow-500 via-orange-600 to-red-500 border-8 border-purple-400">
          <div className="w-full h-full p-8 flex flex-col items-center justify-center text-white" style={blurstyle}>
            <h2 className="text-3xl font-bold drop-shadow-lg">Emergency Contacts</h2>
            <p className="text-center mt-4 text-lg">
              Quickly access emergency contacts and resources during critical situations.
            </p>
          </div>
        </div>
        <div className="item1 h-[100%] w-[80vw] bg-gradient-to-r from-green-500 via-blue-600 to-indigo-500 border-8 border-purple-400">
          <div className="w-full h-full p-8 flex flex-col items-center justify-center text-white" style={blurstyle}>
            <h2 className="text-3xl font-bold drop-shadow-lg">Community Support</h2>
            <p className="text-center mt-4 text-lg">
              Join a community of users sharing real-time updates and safety tips.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroMoving;
