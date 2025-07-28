import { useState, useEffect } from "react";
import {
  TriangleAlert,
  Info,
  BellRing,
  Activity,
  FlameKindling,
  Droplets,
  Mountain,
  Wind,
  AlertTriangle,
  MapPin,
  User,
  ThumbsUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";


const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background stars */}
      <div
        className="absolute inset-0 z-0 bg-stone-100 opacity-80"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero section */}
        <main className="flex-1 container mx-auto px-4 py-12 md:py-16 lg:py-20 ">
          <div className="flex flex-col md:flex-row items-start md:items-center ">
            {/* Left content */}
            <div className="w-full md:w-1/2 space-y-6 mb-10 md:mb-0 z-10 lg:p-4">
              <h1 className="text-4xl lg:text-left md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                It&apos;s your earth,
                <br />
                it&apos;s time to get alert Quickly!
              </h1>

              <p className="text-lg lg:text-left font-bold md:text-xl max-w-xl text-gray-200 leading-relaxed">
                The Rebel alliance is fighting to get rid of the evil empire,
                join the resistance to create a better future for your children.
              </p>

              <div className="flex items-center justify-center lg:justify-start">
                <button className="bg-purple-600 hover:bg-purple-800 cursor-pointer text-white font-bold text-sm lg:text-xl py-6 px-10 rounded-none shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
                  Register for Notifications
                </button>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-black overflow-hidden">
                    <img
                      src="https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-black overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-sm md:text-base text-gray-300">
                  Aayush Dhakal and 4,000 others have already joined
                </span>
              </div>
            </div>

            {/* Right content - X-Wing and Death Star */}
            <div className="w-full md:w-1/2 relative h-64 md:h-80 lg:h-96">
              {/* Death Star */}
              <div className="absolute top-0 right-0 md:top-5 md:right-10 w-24 h-24 md:w-36 md:h-36 opacity-80">
                <img
                  src="/safetyfirst.png"
                  alt="Death Star"
                  className="w-full h-full opacity-70 object-contain scale-200 lg:scale-170"
                />
              </div>

              {/* X-Wing */}
              <div className="absolute right-0 top-1/4 w-full md:w-5/6 h-64 md:h-80 lg:scale-140">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7f/Rotating_earth_animated_transparent.gif?20201022124448"
                  alt="X-Wing Fighter"
                  className="z-20 w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer with logos */}
        <div className="sm:mt-4 relative z-10 w-full bg-gradient-to-r from-purple-800 to-purple-600 py-3 mt-auto">
          <div className="container mx-auto px-4 flex justify-around lg:flex-row flex-col">
            <div className="text-lg mb-2 md:mb-0 font-bold">As seen on:</div>
            <div className="flex flex-col md:flex-row justify-center items-center">
              <div className="flex items-center justify-center space-x-6 md:space-x-8">
                <div className="flex items-center space-x-6 md:space-x-8">
                  {/* Network logos */}

                  <a href="">
                    <TriangleAlert />
                  </a>
                  <a href="">
                    <Info />
                  </a>
                  <a href="">
                    <BellRing />
                  </a>
                  <a href="">
                    <Activity />
                  </a>
                  <a href="">
                    <FlameKindling />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
