import React from "react";
import { FaCrown } from "react-icons/fa";
import "./UpgradeModal.css"; // CSS bhi alag file mein rakhenge

const UpgradeModal = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="pw-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="pw-modal-box upgrade-modal">
        <div className="pw-modal-icon upgrade-icon">
          <FaCrown />
        </div>
        <h3 className="pw-modal-title">Limit Reached!</h3>
        <p className="pw-modal-desc">
          Free users can only generate <b>1 Paper</b> per month. <br />
          Please upgrade to <b>Premium</b> for unlimited access.
        </p>

        <div className="pw-modal-actions vertical">
          <button className="pw-btn-upgrade" onClick={onUpgrade}>
            View Plans & Upgrade
          </button>
          <button className="pw-btn-link" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
