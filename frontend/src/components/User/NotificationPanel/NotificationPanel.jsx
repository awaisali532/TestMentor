import React, { useState } from "react";
import {
  FaBell,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "./NotificationPanel.css";

const NotificationPanel = () => {
  // Mock Data (Backend se replace hoga baad mein)
  const [notifications] = useState([
    {
      id: 1,
      title: "Exam Schedule",
      msg: "Physics test tomorrow at 10 AM.",
      type: "urgent",
      date: "10 mins ago",
    },
    {
      id: 2,
      title: "New Feature",
      msg: "You can now view past results.",
      type: "success",
      date: "2 hours ago",
    },
    {
      id: 3,
      title: "Maintenance",
      msg: "System update at midnight.",
      type: "info",
      date: "Yesterday",
    },
  ]);

  const getIcon = (type) => {
    if (type === "urgent")
      return <FaExclamationCircle className="usr-n-icon text-red" />;
    if (type === "success")
      return <FaCheckCircle className="usr-n-icon text-green" />;
    return <FaInfoCircle className="usr-n-icon text-blue" />;
  };

  return (
    <div className="usr-notif-container">
      <div className="usr-notif-header">
        <h4>Notifications</h4>
        <div className="usr-bell-wrap">
          <FaBell />
          <span className="usr-dot"></span>
        </div>
      </div>

      <div className="usr-notif-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className={`usr-notif-card ${notif.type}`}>
              {getIcon(notif.type)}
              <div className="usr-notif-content">
                <h6>{notif.title}</h6>
                <p>{notif.msg}</p>
                <span className="usr-n-date">{notif.date}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="usr-no-data">No new notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
