import React from "react";
import { FaLayerGroup } from "react-icons/fa";

const PATTERN_CATEGORIES = [
  { value: "GENERAL", label: "General / Mixed" },
  { value: "FULL_BOOK", label: "Full Book (Board Pattern)" },
  { value: "HALF_BOOK", label: "Half Book" },
  { value: "CHAPTER_WISE", label: "Chapter Wise (Short Test)" },
];

const BasicConfig = ({
  formData,
  handleChange,
  preFilledGrade,
  isUserMode,
  subjectsList,
  preFilledSubject,
  longSectionsCount,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h5 className="font-bold text-main mb-4 border-b border-border pb-2">
        Basic Configuration
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-main mb-1">
            Pattern Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. 9th Physics Custom"
            required
            className="w-full bg-bg-body border border-border text-main px-4 py-2.5 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-main mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-bg-body border border-border text-main px-4 py-2.5 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
          >
            {PATTERN_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-main mb-1">
            Class
          </label>
          <select
            name="className"
            value={formData.className}
            onChange={handleChange}
            disabled={!!preFilledGrade}
            className="w-full bg-bg-body border border-border text-main px-4 py-2.5 rounded-xl focus:outline-none focus:border-accent-1 transition-all disabled:opacity-50"
          >
            {["9th", "10th", "11th", "12th"].map((c) => (
              <option key={c} value={c}>
                {c} Class
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-main mb-1">
            Subject
          </label>
          {isUserMode ? (
            <div className="w-full bg-pill-bg border border-border text-main px-4 py-2.5 rounded-xl opacity-70">
              {subjectsList.find((s) => s._id === formData.subject)
                ?.subjectName ||
                preFilledSubject ||
                "Loading..."}
            </div>
          ) : (
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full bg-bg-body border border-border text-main px-4 py-2.5 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
            >
              <option value="">-- Select Subject --</option>
              {subjectsList.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectName}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold text-main mb-1">
            Time Allowed
          </label>
          <input
            name="timeAllowed"
            value={formData.timeAllowed}
            onChange={handleChange}
            className="w-full bg-bg-body border border-border text-main px-4 py-2.5 rounded-xl focus:outline-none focus:border-accent-1 transition-all"
          />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPairingSpecific"
              checked={formData.isPairingSpecific}
              onChange={handleChange}
              className="w-5 h-5 accent-accent-1"
            />
            <span className="font-bold text-main text-sm">
              Enable Strict Pairing Scheme
            </span>
          </label>
        </div>
      </div>

      {longSectionsCount > 0 && (
        <div className="mt-4 p-4 bg-accent-1/5 border border-accent-1/20 rounded-xl flex items-center justify-between">
          <div>
            <label className="block text-sm font-bold text-accent-1 mb-1">
              <FaLayerGroup className="inline mr-1" /> Total Long Qs to Attempt
            </label>
            <p className="text-xs text-muted m-0">
              Max: {longSectionsCount} (Based on Added Sections)
            </p>
          </div>
          <input
            type="number"
            name="longQAttemptCount"
            value={formData.longQAttemptCount}
            onChange={handleChange}
            min="1"
            max={longSectionsCount}
            className="w-24 bg-bg-body border border-accent-1/50 text-main px-3 py-2 rounded-lg focus:outline-none text-center font-bold"
          />
        </div>
      )}

      <div className="mt-4 p-3 bg-pill-bg text-center rounded-xl font-bold text-main border border-border">
        Total Marks:{" "}
        <span className="text-accent-1 text-lg">{formData.totalMarks}</span>
      </div>
    </div>
  );
};

export default BasicConfig;
