import React from "react";
import ReactDOM from "react-dom"; // ✅ Import ReactDOM
import "./TMLoader.css";

const TMLoader = ({ message = "Processing..." }) => {
  // ✅ Portal Logic: Ye component ko 'root' div se bahar nikal kar
  // direct <body> tag ke end mein chipka dega.
  // Is se Parent ki CSS/Animation ka asar is par nahi hoga.

  return ReactDOM.createPortal(
    <div className="tm-overlay">
      <div className="tm-loader-box">
        {/* Spinning Ring */}
        <div className="tm-spinner"></div>

        {/* Center Brand Name */}
        <div className="tm-text">TM</div>
      </div>

      {/* Optional Message */}
      <p className="tm-message">{message}</p>
    </div>,
    document.body // 👈 Target: Direct Body
  );
};

export default TMLoader;
