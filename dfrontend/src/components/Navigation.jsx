"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  X,
  MenuIcon,
  Settings,
  LogOut,
  Lock,
  Search,
  icons,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FcLandscape, FcDonate } from "react-icons/fc";
import { IoPieChartSharp } from "react-icons/io5";
import { FaVolcano } from "react-icons/fa6";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { Link } from "react-router";
import { useUsername } from "../context/UsernameContext";
import axios from "axios";
import {
  UserDetailsProvider,
  useUserDetails,
} from "../context/UserDetailsContext";

const NewNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const username = useUsername();
  const profileRef = useRef(null);
  const { userDetails } = useUserDetails();
  const [userDetailsFetched, setUserDetailsFetched] = useState([]);
  console.log(localStorage.getItem("access_token"));

  // Check if user is authenticated on component mount and when dependencies change
  useEffect(() => {
    if (userDetails) {
      setUserDetailsFetched(userDetails);
    }
    const checkAuth = () => {
      const accessToken = localStorage.getItem("access_token");
      setIsAuthenticated(!!accessToken);
    };
    checkAuth();

    // Optional: Set up an event listener for storage changes
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [userDetails]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const menuItems = [
    {
      icon: <FcLandscape />,
      label: "Disaster List",
      url: "/disaster-list",
    },
    {
      icon: <FaVolcano />,
      label: "Register Disaster",
      url: "/register-disaster",
    },
    {
      icon: <FcDonate />,
      label: "Help List",
      url: "/all-help-requests",
    },
    {
      icon: <AiFillSafetyCertificate />,
      label: "Help",
      url: "/request-help",
    },
    {
      icon: <IoPieChartSharp />,
      label: "Analytics",
      url: "/analytics",
    },
  ];

  // Animation variants for the menu container
  const menuContainerVariants = {
    hidden: {
      opacity: 0,
      height: 0,
    },
    visible: {
      opacity: 1,
      height: "calc(100vh - 5rem)",
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  // Animation variants for each menu item
  const menuItemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Animation variants for profile dropdown
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50">
        <nav
          style={{
            boxShadow: "rgba(34, 197, 94, 0.3) 0px 50px 50px -20px inset",
            // boxShadow: "rgba(255, 11, 245, 0.33) 0px 50px 50px -30px inset",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
          className="sticky top-0 left-0 right-0 navbar flex justify-between flex-wrap bg-slate-50 p-4 md:p-5 lg:p-6 transition-all duration-500 ease"
        >
          <div className="left text-gray-800">
            <div className="menu flex gap-1 md:gap-2 cursor-pointer items-center h-full">
              <button
                className="text-gray-800 focus:outline-none cursor-pointer transition-transform duration-500 ease"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {isOpen ? (
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <MenuIcon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </motion.div>
              </button>
              <div className="text text-md md:text-xl font-sans font-bold">
                MENU
              </div>
            </div>
          </div>

          <div className="middle lg:pl-23 ">
            <div className="logo h-10 w-10">
              <Link to={"/"}>
                <img
                  className="scale-170"
                  style={{ objectFit: "cover" }}
                  src="/logo3.png"
                  alt="logo"
                />
              </Link>
            </div>
          </div>

          <div className="right text-gray-800">
            <ul className="flex gap-3 md:gap-5 lg:gap-7 items-center h-full">
              {isAuthenticated ? (
                <li
                  className="flex gap-1 md:gap-2 cursor-pointer items-center relative"
                  ref={profileRef}
                >
                  <div
                    style={{
                      backgroundImage: `url('${userDetailsFetched.profile_picture}')`,
                      backgroundColor: "gainsboro",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    className="rounded-full h-[40px] w-[40px] cursor-pointer flex items-center justify-center"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {!userDetailsFetched.profile_picture && (
                      <User className="h-6 w-6 text-gray-700" />
                    )}
                  </div>
                  <span
                    className="hidden font-bold font-sans md:inline p-2 cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {username?.username || "User"}
                  </span>
                  <motion.div
                    initial={false}
                    animate={{ rotate: isProfileOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-600"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </motion.div>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg z-50"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="rounded-md overflow-hidden">
                          {/* Header with profile image */}
                          <div className="bg-gray-700 p-3 flex items-center gap-3">
                            <div
                              style={{
                                backgroundImage: `url('${userDetailsFetched.profile_picture}')`,
                                backgroundColor: "gainsboro",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              className="bg-gray-300 border-green-300 border-3 bg-cover bg-center rounded-full h-[40px] w-[40px] flex items-center justify-center"
                            >
                              {!userDetailsFetched.profile_picture && (
                                <User className="h-6 w-6 text-gray-700" />
                              )}
                            </div>
                            <div className="text-white font-medium truncate">
                              {username?.username || "User"}
                            </div>
                          </div>

                          {/* Menu items */}
                          <div className="bg-white py-1">
                            <Link
                              to="/settings/profile"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <User className="h-5 w-5" />
                              <span>Account</span>
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="h-5 w-5" />
                              <span>Settings</span>
                            </Link>

                            <div className="border-t border-gray-200"></div>

                            <Link
                              to="/logout"
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={async () => {
                                try {
                                  const accessToken =
                                    localStorage.getItem("access_token");
                                  if (accessToken) {
                                    await axios.post(`${API_URL}/logout`, {
                                      refresh_token: accessToken,
                                    });
                                    localStorage.removeItem("access_token");
                                    setIsAuthenticated(false);
                                  }
                                } catch (error) {
                                  console.error("Error during logout:", error);
                                }
                              }}
                            >
                              <LogOut className="h-5 w-5" />
                              <span>Log Out</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/register"
                      className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
                    >
                      <Lock className="h-5 w-5" />
                      <span className="font-medium">Signup</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Login</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* AnimatePresence ensures animations complete before unmounting */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="w-full overflow-hidden"
                variants={menuContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Added flex container with min-height to center content vertically */}
                <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center">
                  <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 lg:gap-30 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 text-gray-800 group">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={index}
                        className={`flex flex-col gap-4 md:gap-6 items-center justify-center text-center
                          ${index >= 3 ? "lg:px-[25rem]" : ""}`}
                        variants={menuItemVariants}
                      >
                        <Link
                          to={item.url || "#"}
                          className="text-center flex flex-col justify-center items-center gap-4 md:gap-6 font-medium text-base md:text-lg lg:text-xl"
                        >
                          <motion.div
                            className="text-2xl md:text-3xl lg:text-4xl"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {item.icon}
                          </motion.div>
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  );
};

const Navigation = () => (
  <UserDetailsProvider>
    <NewNavigation />
  </UserDetailsProvider>
);

export default Navigation;
