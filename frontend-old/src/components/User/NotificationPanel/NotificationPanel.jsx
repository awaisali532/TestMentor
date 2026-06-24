import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaCheck, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import "./NotificationPanel.css";

const NotificationPanel = ({ isOpen, onUpdateCount }) => {
  const [lang, setLang] = useState("ur"); // Default Urdu
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef(0);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications`);
      const newData = res.data;
      setNotifications(newData);
      setLoading(false);

      if (!isOpen && newData.length > prevCountRef.current) {
        const diff = newData.length - prevCountRef.current;
        onUpdateCount((prev) => prev + diff);
      }
      prevCountRef.current = newData.length;
    } catch (err) {
      console.error("Failed to load alerts");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="usr-notif-wrapper">
      <div className="usr-notif-header-solid">
        <h5 className="m-0 fw-bold">Alerts</h5>
        <div className="lang-toggle-small">
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            className={lang === "ur" ? "active" : ""}
            onClick={() => setLang("ur")}
          >
            اردو
          </button>
        </div>
      </div>

      <div className="usr-notif-body custom-scrollbar">
        {loading ? (
          <p className="text-center mt-4">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-muted mt-4">No new alerts.</p>
        ) : (
          notifications.map((item) => (
            <div key={item._id} className="alert-item">
              <div className="alert-icon">
                {item.type === "success" && (
                  <FaCheck style={{ color: "#10b981" }} />
                )}
                {item.type === "info" && (
                  <FaInfoCircle style={{ color: "#3b82f6" }} />
                )}
                {item.type === "warning" && (
                  <FaExclamationTriangle style={{ color: "#f59e0b" }} />
                )}
                {item.type === "urgent" && (
                  <FaExclamationTriangle style={{ color: "#ef4444" }} />
                )}
              </div>

              {/* ✅ FIX 1: Class sirf tab lage jab Lang 'ur' ho */}
              <div
                className={`alert-content ${lang === "ur" ? "rtl-text" : ""}`}
              >
                {/* ✅ FIX 2: Conditional Font Class */}
                <p className={lang === "ur" ? "urdu-font" : ""}>
                  {lang === "ur" ? item.messageUr : item.messageEn}
                </p>
                <span className="alert-date">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
