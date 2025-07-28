"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";

export default function ModernHero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Background dotted lines */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-blue-300" />
        <div className="absolute top-1/4 left-0 right-0 border-t border-dashed border-blue-300" />
        <div className="absolute top-3/4 left-0 right-0 border-t border-dashed border-blue-300" />
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto w-full z-10">
        {/* Header section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            SafeSignal
            <br />
            Flash Disaster Alert System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SafeSignal Provides a instant Alert System for Natural Disasters. It
            helps to track and alert users about disasters in real-time.
          </p>
        </motion.div>

        {/* Stats section */}
        <motion.div
          className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-700">8%</span>
            <div className="bg-gray-200 rounded-full px-3 py-1 text-sm">
              Without SafeSignal
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-blue-600">75%</span>
            <div className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 text-sm">
              With SafeSignal
              <div className="w-10 h-5 bg-green-400 rounded-full relative flex items-center px-1">
                <div className="w-3 h-3 bg-white rounded-full absolute right-1"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.button
            className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/register-disaster" className="text-white">
              Report Disaster
            </Link>
          </motion.button>
          <motion.button
            className="bg-white cursor-pointer hover:bg-gray-100 text-gray-700 font-medium py-3 px-8 rounded-full border border-gray-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/about" className="text-gray-700">
              About SafeSignal
            </Link>
          </motion.button>
        </motion.div>

        {/* Diagram section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Left card - Customers */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-sm text-gray-500 mb-4">Our Team</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src="/profile.jpg"
                    alt="Customer 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src="/aayam.jpg"
                    alt="Customer 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src="/aayam.jpg"
                    alt="Customer 3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src="/profile.jpg"
                    alt="Customer 4"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Middle section - TrustLine */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center space-x-6 mb-4">
                <motion.div
                  className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center"
                  animate={{
                    x: isHovered ? [-10, 10, -10] : 0,
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                    },
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </motion.div>
                <motion.div
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"
                  animate={{
                    y: isHovered ? [-10, 10, -10] : 0,
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      delay: 0.3,
                    },
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </motion.div>
              </div>

              <motion.div
                className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full flex items-center gap-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                animate={{
                  y: isHovered ? [0, -5, 0] : 0,
                  transition: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="font-medium">SafeSignal</span>
              </motion.div>
            </div>

            {/* Right card - CX Team */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm text-gray-500">Our Top Helpers</h3>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
                  Team
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-1">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi5uchR8ys7SD1OFfIPTGi6BKuzF8xFsPXRA&s"
                      alt="Team 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs">Team 1</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs">AI</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-1">
                    <img
                      src="https://www.gstatic.com/devrel-devsite/prod/vce7dc8716edeb3714adfe4dd15b25490031be374149e3613a8b7fb0be9fc4a25/firebase/images/touchicon-180.png"
                      alt="Team 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs">Team 3</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs">Docs</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-1">
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/014/043/528/non_2x/attention-warning-alert-sign-symbol-with-exclamation-mark-illustration-eps-10-vector.jpg"
                      alt="Team 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs">Team 2</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-teal-200 flex items-center justify-center mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <span className="text-xs">Scan</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Security badge */}
          <motion.div
            className="absolute -top-10 right-0 md:top-0 md:right-0 bg-white rounded-lg p-3 shadow-md flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-600">Instant Notification</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
