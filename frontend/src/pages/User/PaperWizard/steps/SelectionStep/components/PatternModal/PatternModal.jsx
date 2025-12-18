import React, { useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import "./PatternModal.css";

const PatternModal = ({ config, setConfig, onClose }) => {
  const [localConfig, setLocalConfig] = useState({ ...config });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value >= 0) setLocalConfig({ ...localConfig, [name]: value });
  };

  const handleSave = () => {
    setConfig(localConfig);
    onClose();
  };

  return (
    <div className="pattern-modal-overlay">
      <div className="pattern-modal">
        <div className="pm-header">
          <h4>Quick Edit Pattern</h4>
          <FaTimes className="close-btn" onClick={onClose} />
        </div>

        <div className="pm-body">
          <div className="pm-row">
            <label>MCQs Count</label>
            <input
              type="number"
              name="mcqCount"
              value={localConfig.mcqCount}
              onChange={handleChange}
            />
          </div>
          <div className="pm-row">
            <label>Short Qs Count</label>
            <input
              type="number"
              name="shortCount"
              value={localConfig.shortCount}
              onChange={handleChange}
            />
          </div>
          <div className="pm-row">
            <label>Long Qs Count</label>
            <input
              type="number"
              name="longCount"
              value={localConfig.longCount}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pm-footer">
          <button className="pm-save-btn" onClick={handleSave}>
            <FaSave className="me-2" /> Update Pattern
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternModal;
