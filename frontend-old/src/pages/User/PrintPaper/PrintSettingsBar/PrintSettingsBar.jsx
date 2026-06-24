import React from "react";
import { FaPrint, FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import "./PrintSettingsBar.css";

const PrintSettingsBar = ({
  settings,
  setSettings,
  onPrint,
  onBack,
  onEdit,
  onSave,
  isSaved,
  isSaving,
}) => {
  // ✅ FIX: Handle Numbers correctly (String to Number conversion)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? 0
              : parseFloat(value) // Convert string "12" to number 12
            : value,
    }));
  };

  return (
    <div className="ps-bar no-print">
      <div className="container-fluid">
        {/* ROW 1: Controls */}
        <div className="row g-2 align-items-end mb-2">
          {/* FONT SIZES */}
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

          {/* SPACING */}
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
            <label className="ps-label">Header</label>
            <input
              type="number"
              step="0.1"
              className="ps-input"
              name="headerSize"
              value={settings.headerSize}
              onChange={handleChange}
            />
          </div>

          {/* DROPDOWNS */}
          <div className="col-md-2 col-4">
            <label className="ps-label">Paper Size</label>
            <select
              className="ps-select"
              name="paperSize"
              value={settings.paperSize}
              onChange={handleChange}
            >
              <option value="a4">A4</option>
              <option value="legal">Legal</option>
              <option value="letter">Letter</option>
            </select>
          </div>

          <div className="col-md-2 col-4">
            <label className="ps-label">Watermark</label>
            <select
              className="ps-select"
              name="watermark"
              value={settings.watermark}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="logo">Logo</option>
              <option value="confidential">Institute</option>
            </select>
          </div>

          <div className="col-md-2 col-4">
            <label className="ps-label">Weight</label>
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
              style={{ padding: 0, height: "34px" }}
            />
          </div>
        </div>

        {/* ROW 2: TOGGLES & BUTTONS */}
        <div
          className="row g-2 align-items-center border-top pt-2 mt-1"
          style={{ borderColor: "#ddd" }}
        >
          {/* Toggles */}
          <div className="col-md-5 d-flex gap-3 flex-wrap">
            <label className="ps-toggle-wrapper">
              <input
                type="checkbox"
                name="showSyllabus"
                checked={settings.showSyllabus}
                onChange={handleChange}
              />
              <span className="ps-toggle-text">Syllabus</span>
            </label>

            <label className="ps-toggle-wrapper">
              <input
                type="checkbox"
                name="showBubbleSheet"
                checked={settings.showBubbleSheet}
                onChange={handleChange}
              />
              <span className="ps-toggle-text">Bubbles</span>
            </label>

            <label className="ps-toggle-wrapper">
              <input
                type="checkbox"
                name="showAnswerKey"
                checked={settings.showAnswerKey}
                onChange={handleChange}
              />
              <span className="ps-toggle-text text-primary fw-bold">
                Show Key
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="col-md-7 text-end d-flex gap-2 justify-content-end">
            <button className="ps-btn ps-btn-back" onClick={onBack}>
              <FaArrowLeft /> Back
            </button>

            <button
              className="ps-btn btn-warning text-white"
              style={{ background: "#f59e0b" }}
              onClick={onEdit}
            >
              <FaEdit /> Edit
            </button>

            {!isSaved && (
              <button
                className="ps-btn btn-success text-white"
                style={{ background: "#10b981" }}
                onClick={onSave}
                disabled={isSaving}
              >
                <FaSave /> {isSaving ? "Saving..." : "Save"}
              </button>
            )}

            <button className="ps-btn ps-btn-print" onClick={onPrint}>
              <FaPrint /> PRINT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettingsBar;
