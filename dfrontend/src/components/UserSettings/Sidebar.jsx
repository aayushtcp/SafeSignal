"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Home,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";
import Navigation from "../Navigation";
import { useUserDetails } from "../../context/UserDetailsContext";

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("General Settings");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const { userDetails } = useUserDetails();
  const [userDetailsFetched, setUserDetailsFetched] = useState([]);

  // Add useEffect for window resize handling
  useEffect(() => {
    if (userDetails) {
      setUserDetailsFetched(userDetails);
    }
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768 && collapsed) {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed, userDetails]);

  const settingsItems = [
    {
      title: "Profile",
      icon: User,
      href: "/settings/profile",
    },
    {
      title: "General Settings",
      icon: Settings,
      href: "/settings",
      subItems: [
        {
          title: "Settings",
          href: "/settings",
        },
        {
          title: "Appearance",
          href: "/settings/appearance",
        },
      ],
    },
  ];

  const toggleSubmenu = (title) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <>
      <Navigation />
      <div className="settings-container flex flex-col md:flex-row">
        <div
          className={`sidebar md:w-1/4 p-2 md:p-4 flex flex-col h-auto md:h-screen bg-slate-50 border-b md:border-r border-slate-200 transition-all duration-300 relative ${
            collapsed ? "md:w-20" : "md:w-64"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-2 md:p-4 flex justify-between md:justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
                <Home className="h-4 w-4" />
              </div>
              {(!collapsed || window.innerWidth < 768) && (
                <div className="font-semibold">Settings</div>
              )}
            </div>
            <button
              className="md:hidden"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  collapsed ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            <div
              className={`h-px bg-slate-200 my-4 hidden md:block ${
                collapsed ? "md:hidden" : ""
              }`}
            />
          </div>

          {/* Sidebar Content */}
          <div
            className={`${
              collapsed && window.innerWidth < 768
                ? "hidden"
                : "flex-1 overflow-auto"
            } px-1 md:px-3 ${
              collapsed && window.innerWidth >= 768
                ? "md:flex md:flex-col md:items-center"
                : ""
            }`}
          >
            <div className="space-y-1">
              {(!collapsed || window.innerWidth < 768) && (
                <h3 className="px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Settings
                </h3>
              )}
              <div className="mt-2 space-y-1">
                {settingsItems.map((item) => (
                  <div
                    key={item.title}
                    className={`${
                      collapsed && window.innerWidth >= 768
                        ? "md:flex md:justify-center"
                        : ""
                    }`}
                  >
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() => toggleSubmenu(item.title)}
                          className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                            location.pathname.startsWith(item.href)
                              ? "bg-slate-200 text-slate-900 font-medium"
                              : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {(!collapsed || window.innerWidth < 768) && (
                            <>
                              <span>{item.title}</span>
                              <ChevronDown
                                className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                                  openSubmenu === item.title ? "rotate-180" : ""
                                }`}
                              />
                            </>
                          )}
                        </button>
                        {(!collapsed || window.innerWidth < 768) &&
                          openSubmenu === item.title && (
                            <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-2">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.title}
                                  to={subItem.href}
                                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                    location.pathname === subItem.href
                                      ? "bg-slate-200 text-slate-900 font-medium"
                                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                  }`}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                          location.pathname === item.href
                            ? "bg-slate-200 text-slate-900 font-medium"
                            : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {(!collapsed || window.innerWidth < 768) && (
                          <span>{item.title}</span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div
            className={`border-t border-slate-200 p-4 ${
              collapsed && window.innerWidth < 768 ? "hidden" : ""
            }`}
          >
            <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundImage: `url('${userDetailsFetched.profile_picture}')`,
                      backgroundColor: "gainsboro",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    className="rounded-full h-8 w-8 cursor-pointer flex items-center justify-center"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  ></div>
              {(!collapsed || window.innerWidth < 768) && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userDetailsFetched.username}</span>
                  <span className="text-xs text-slate-500">
                    {userDetailsFetched.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Collapse Toggle - Only visible on desktop */}
          <button
            className="hidden md:flex absolute -right-3 top-10 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-md items-center justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                collapsed ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
        <div className="content w-full md:w-3/4 p-4 bg-slate-50">
          <Outlet />
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default Sidebar;
