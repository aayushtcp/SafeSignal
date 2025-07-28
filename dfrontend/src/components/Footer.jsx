import React from "react";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-700 py-8 px-4 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left"
        >
          <h2 className="text-2xl font-semibold">Safe Signal</h2>
          <p className="text-sm mt-2 p-2 bg-green-500 rounded-lg font-bold text-white w-full lg:w-max">Instant Alert⚠️!</p>
        </motion.div>

        {/* Navigation Links */}
        <motion.ul 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center space-x-6 text-sm"
        >
          <li><a href="#" className="hover:text-gray-500 transition">Home</a></li>
          <li><a href="#" className="hover:text-gray-500 transition">About</a></li>
          <li><a href="#" className="hover:text-gray-500 transition">Services</a></li>
          <li><a href="#" className="hover:text-gray-500 transition">Contact</a></li>
          <li><a href="#" className="hover:text-gray-500 transition">Team</a></li>
        </motion.ul>

        {/* Social Icons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex justify-center md:justify-end space-x-4"
        >
          <a href="#" className="text-gray-600 hover:text-gray-900 transition text-xl"><FaFacebook /></a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition text-xl"><FaTwitter /></a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition text-xl"><FaInstagram /></a>
        </motion.div>
      </div>

      {/* Copyright Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center text-sm text-gray-500 mt-6"
      >
        &copy; {new Date().getFullYear()} SafeSignal. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;
