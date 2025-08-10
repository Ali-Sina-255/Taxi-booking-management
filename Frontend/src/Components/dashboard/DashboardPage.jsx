import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { FaBell, FaEnvelope, FaSearch, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const DashboardPage = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [isFocused, setIsFocused] = useState(false);
  const { profile, loading } = useSelector((state) => state.user);

  const fullProfilePhotoUrl = profile?.profile_photo
    ? `${BASE_URL}${profile.profile_photo}`
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <div className="bg-gray-100 py-2 w-full flex items-center justify-between px-4 shadow-sm">
          <div className="relative flex items-center">
            <FaSearch className="absolute left-3 text-gray-600 text-base pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-10 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-300 ease-in-out
          ${isFocused ? "w-52" : "w-10"} bg-white`}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer">
              <AnimatePresence mode="wait">
                {loading && !profile ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    {fullProfilePhotoUrl ? (
                      <img
                        src={fullProfilePhotoUrl}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <FaUser className="text-gray-600" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-500">
                      {profile
                        ? `${profile.first_name} ${profile.last_name}`
                        : "User"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <MainContent
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
