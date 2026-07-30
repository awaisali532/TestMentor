import React from "react";
import { FaPrint, FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";

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
              : parseFloat(value)
            : value,
    }));
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-1000 bg-white border-b border-slate-200 shadow-md p-3 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* ROW 1: Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-17.5">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Urdu Px
            </label>
            <input
              type="number"
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-blue-500"
              name="urduFontSize"
              value={settings.urduFontSize}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1 min-w-17.5">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Eng Px
            </label>
            <input
              type="number"
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-blue-500"
              name="engFontSize"
              value={settings.engFontSize}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1 min-w-17.5">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Math Px
            </label>
            <input
              type="number"
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-blue-500"
              name="eqFontSize"
              value={settings.eqFontSize}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1 min-w-17.5">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Line H.
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-blue-500"
              name="lineHeight"
              value={settings.lineHeight}
              onChange={handleChange}
            />
          </div>



          <div className="flex-1 min-w-25">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Watermark
            </label>
            <select
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-blue-500 cursor-pointer"
              name="watermark"
              value={settings.watermark}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="logo">Logo</option>
              <option value="confidential">Institute</option>
            </select>
          </div>

          <div className="flex-1 min-w-25">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Weight
            </label>
            <select
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-blue-500 cursor-pointer"
              name="fontWeight"
              value={settings.fontWeight}
              onChange={handleChange}
            >
              <option value="400">Normal</option>
              <option value="600">Medium</option>
              <option value="700">Bold</option>
            </select>
          </div>

          <div className="w-15">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Color
            </label>
            <input
              type="color"
              className="w-full h-8 cursor-pointer border-0 p-0"
              name="fontColor"
              value={settings.fontColor}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ROW 2: Toggles & Buttons */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-2">
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                name="showSyllabus"
                checked={settings.showSyllabus}
                onChange={handleChange}
              />{" "}
              Syllabus
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                name="separateObjective"
                checked={settings.separateObjective || false}
                onChange={handleChange}
              />{" "}
              Separate Obj
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                name="showBubbleSheet"
                checked={settings.showBubbleSheet}
                onChange={handleChange}
              />{" "}
              Bubbles
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-blue-600">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-600"
                name="showAnswerKey"
                checked={settings.showAnswerKey}
                onChange={handleChange}
              />{" "}
              Show Key
            </label>
          </div>

          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-200 text-slate-700 rounded hover:opacity-90 transition-opacity cursor-pointer"
              onClick={onBack}
            >
              <FaArrowLeft /> Back
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-amber-500 text-white rounded hover:opacity-90 transition-opacity cursor-pointer"
              onClick={onEdit}
            >
              <FaEdit /> Edit
            </button>
            {!isSaved && (
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                onClick={onSave}
                disabled={isSaving}
              >
                <FaSave /> {isSaving ? "Saving..." : "Save"}
              </button>
            )}
            <button
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-linear-to-r from-emerald-500 to-emerald-700 text-white shadow-md rounded hover:opacity-90 transition-opacity cursor-pointer"
              onClick={onPrint}
            >
              <FaPrint /> PRINT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettingsBar;
