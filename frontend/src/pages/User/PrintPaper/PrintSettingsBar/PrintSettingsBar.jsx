import React from "react";
import { FaPrint, FaArrowLeft } from "react-icons/fa";
import "./PrintSettingsBar.css";

const PrintSettingsBar = ({ settings, setSettings, onPrint, onBack }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="ps-bar no-print">
      <div className="container-fluid">
        {/* ROW 1: CONTROLS */}
        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-1 col-4">
            <label className="ps-label">Line H.</label>
            <input
              type="number"
              step="0.1"
              className="ps-input"
              name="lineHeight"
              value={settings.lineHeight}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-1 col-4">
            <label className="ps-label">Urdu Px</label>
            <input
              type="number"
              className="ps-input"
              name="urduFontSize"
              value={settings.urduFontSize}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-1 col-4">
            <label className="ps-label">Eng Px</label>
            <input
              type="number"
              className="ps-input"
              name="engFontSize"
              value={settings.engFontSize}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-1 col-4">
            <label className="ps-label">Math Px</label>
            <input
              type="number"
              className="ps-input"
              name="eqFontSize"
              value={settings.eqFontSize}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 col-4">
            <label className="ps-label">Header Size</label>
            <input
              type="number"
              step="0.1"
              className="ps-input"
              name="headerSize"
              value={settings.headerSize}
              onChange={handleChange}
            />
          </div>

          {/* ✅ NEW: WATERMARK DROPDOWN */}
          <div className="col-md-2 col-4">
            <label className="ps-label">Watermark</label>
            <select
              className="ps-select"
              name="watermark"
              value={settings.watermark}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="logo">Institute Logo</option>
              <option value="confidential">Institute Name</option>
            </select>
          </div>

          <div className="col-md-2 col-4">
            <label className="ps-label">Font Weight</label>
            <select
              className="ps-select"
              name="fontWeight"
              value={settings.fontWeight}
              onChange={handleChange}
            >
              <option value="400">Normal</option>
              <option value="600">Medium</option>
              <option value="700">Bold</option>
            </select>
          </div>
          <div className="col-md-1 col-4">
            <label className="ps-label">Color</label>
            <input
              type="color"
              className="ps-input"
              name="fontColor"
              value={settings.fontColor}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ROW 2: TOGGLES & BUTTONS */}
        <div
          className="row g-2 align-items-center border-top pt-2"
          style={{ borderColor: "var(--u-border)" }}
        >
          <div className="col-md-8 d-flex gap-4 flex-wrap">
            <label className="ps-toggle-wrapper">
              <input
                type="checkbox"
                name="showBubbleSheet"
                checked={settings.showBubbleSheet}
                onChange={handleChange}
              />
              <span className="ps-toggle-text">Bubble Sheet</span>
            </label>
            <label className="ps-toggle-wrapper">
              <input
                type="checkbox"
                name="showSyllabus"
                checked={settings.showSyllabus}
                onChange={handleChange}
              />
              <span className="ps-toggle-text">Syllabus Info</span>
            </label>
            <label className="ps-toggle-wrapper">
              <input
                type="checkbox"
                name="showAnswerKey"
                checked={settings.showAnswerKey}
                onChange={handleChange}
              />
              <span
                className="ps-toggle-text"
                style={{ color: "var(--u-accent)" }}
              >
                Print Answer Key
              </span>
            </label>
          </div>

          <div className="col-md-4 text-end d-flex gap-2 justify-content-end">
            <button className="ps-btn ps-btn-back" onClick={onBack}>
              <FaArrowLeft /> Back
            </button>
            <button className="ps-btn ps-btn-print" onClick={onPrint}>
              <FaPrint /> PRINT PAPER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettingsBar;
