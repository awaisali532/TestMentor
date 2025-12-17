import React, { useState } from "react";
import { FaBell, FaCheck, FaInfoCircle } from "react-icons/fa";
import "./NotificationPanel.css";

const NotificationPanel = () => {
  const [lang, setLang] = useState("ur"); // Default Urdu as per screenshot

  // Mock Data with Dual Language Support
  const [notifications] = useState([
    {
      id: 1,
      type: "success",
      en: "Click here to download Urdu Font.",
      ur: "اُردو فونٹ ڈاؤن لوڈ کرنے کے لیے کلک کریں۔",
      date: "New",
    },
    {
      id: 2,
      type: "success",
      en: "New 1st Year data has been uploaded.",
      ur: "نیو فرسٹ ایئر کا ڈیٹا اپلوڈ ہو چکا ہے۔",
      date: "Today",
    },
    {
      id: 3,
      type: "success",
      en: "New 9th Class data has been uploaded.",
      ur: "نیو نہم کا ڈیٹا اپلوڈ ہو چکا ہے۔",
      date: "Yesterday",
    },
    {
      id: 4,
      type: "info",
      en: "Added font size option for Equations in Math papers.",
      ur: "ریاضی کے پیپر میں موجود مساوات (Equations) کا فونٹ سائز بڑھانے کی آپشن شامل کر دی گئی ہے۔",
      date: "2 days ago",
    },
    {
      id: 5,
      type: "success",
      en: "As per new board policy, 9th & 10th Islamiyat is now combined.",
      ur: "بورڈ کی نئی پالیسی کے مطابق نہم اور دہم اسلامیات لازمی کو کمبائن کر دیا گیا ہے۔",
      date: "3 days ago",
    },
    {
      id: 6,
      type: "success",
      en: "Pak Studies for 9th class removed as per new policy.",
      ur: "بورڈ کی نئی پالیسی کے مطابق مطالعہ پاکستان کو نہم کلاس میں سے ختم کر دیا گیا ہے۔",
      date: "Last Week",
    },
  ]);

  return (
    <div className="usr-notif-wrapper">
      {/* HEADER */}
      <div className="usr-notif-header-solid">
        <div className="d-flex align-items-center gap-2">
          <FaBell className="bell-shake" />
          <h5 className="m-0 fw-bold">New Alerts</h5>
        </div>

        {/* Language Toggle */}
        <div className="lang-toggle">
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            ENG
          </button>
          <button
            className={lang === "ur" ? "active" : ""}
            onClick={() => setLang("ur")}
          >
            اردو
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="usr-notif-body custom-scrollbar">
        {notifications.map((item) => (
          <div key={item.id} className="alert-item">
            {/* Icon */}
            <div className="alert-icon">
              {item.type === "success" ? <FaCheck /> : <FaInfoCircle />}
            </div>

            {/* Content */}
            <div className={`alert-content ${lang === "ur" ? "rtl-text" : ""}`}>
              <p>{lang === "ur" ? item.ur : item.en}</p>
              <span className="alert-date">{item.date}</span>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-center text-muted mt-4">No new alerts.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
