import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaBell,
  FaCheck,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("ur");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [badgeCount, setBadgeCount] = useState(0);

  const dropdownRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications`);
      const newData = res.data;
      setNotifications(newData);
      setLoading(false);

      // ✅ FRONTEND BADGE LOGIC (Until Backend 'isRead' is ready)
      const lastSeenTotal = parseInt(
        localStorage.getItem("tm_notif_seen_count") || "0",
      );

      if (newData.length > lastSeenTotal) {
        setBadgeCount(newData.length - lastSeenTotal);
      } else {
        setBadgeCount(0);
      }
    } catch (err) {
      console.error("Failed to load alerts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);

    // ✅ Mark as read on frontend when opened
    if (!isOpen && notifications.length > 0) {
      localStorage.setItem(
        "tm_notif_seen_count",
        notifications.length.toString(),
      );
      setBadgeCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 
        ✅ CUSTOM SHAKE ANIMATION FOR BELL 
        Injecting style here to ensure it works without tailwind.config changes 
      */}
      <style>
        {`
          @keyframes bellShake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(15deg); }
            50% { transform: rotate(-15deg); }
            75% { transform: rotate(10deg); }
          }
          .animate-bell-shake {
            animation: bellShake 1.5s ease-in-out infinite;
            transform-origin: top center;
          }
        `}
      </style>

      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-full text-muted hover:text-accent-1 hover:bg-pill-bg transition-colors cursor-pointer"
      >
        <FaBell
          size={20}
          className={badgeCount > 0 ? "animate-bell-shake text-accent-1" : ""}
        />

        {/* ✅ BADGE DISPLAY */}
        {badgeCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-card shadow-sm">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
          <div className="bg-accent-1 text-white p-4 flex justify-between items-center shrink-0">
            <h5 className="font-bold m-0">Alerts</h5>
            <div className="flex bg-white/20 p-1 rounded-full">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === "en" ? "bg-white text-accent-1" : "text-white/80"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ur")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === "ur" ? "bg-white text-accent-1" : "text-white/80"}`}
              >
                اردو
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-3 bg-bg-body custom-scrollbar flex-1 max-h-96">
            {loading ? (
              <p className="text-center text-muted py-4 text-sm">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-muted py-4 text-sm">
                No new alerts.
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className="bg-card border border-border rounded-xl p-3 mb-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="shrink-0 mt-1">
                    {item.type === "success" && (
                      <FaCheck className="text-green-500" />
                    )}
                    {item.type === "info" && (
                      <FaInfoCircle className="text-blue-500" />
                    )}
                    {(item.type === "warning" || item.type === "urgent") && (
                      <FaExclamationTriangle
                        className={
                          item.type === "urgent"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }
                      />
                    )}
                  </div>
                  <div
                    className={`flex-1 ${lang === "ur" ? "text-right font-[Jameel_Noori_Nastaleeq] text-lg leading-relaxed" : "text-left text-sm"}`}
                  >
                    <p className="text-main mb-1">
                      {lang === "ur" ? item.messageUr : item.messageEn}
                    </p>
                    <span className="text-xs text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
