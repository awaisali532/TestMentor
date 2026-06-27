import React from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const PasswordChecker = ({ password }) => {
  // 1. Validation Criteria
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    {
      label: "Special character (!@#$)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  // 2. Count How Many Conditions Met
  const metCount = criteria.filter((c) => c.met).length;

  // 3. Determine Strength Level, Color, and Emoji
  let strength = "Weak";
  let color = "bg-red-500";
  let emoji = "😟";
  let width = "w-1/3";

  if (metCount === 5) {
    strength = "Strong";
    color = "bg-green-500";
    emoji = "😎";
    width = "w-full";
  } else if (metCount >= 3) {
    strength = "Normal";
    color = "bg-yellow-500";
    emoji = "😐";
    width = "w-2/3";
  } else if (metCount === 0) {
    width = "w-0";
  }

  return (
    <div className="mt-1 mb-6 bg-card border border-border p-4 rounded-xl shadow-sm transition-all duration-300">
      {/* Header: Strength & Emoji */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-extrabold text-main">
          Password Strength:{" "}
          <span
            className={`${color.replace("bg-", "text-")} transition-colors`}
          >
            {strength}
          </span>
        </span>
        <span className="text-2xl animate-fade-in">{emoji}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-pill-bg rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${color} ${width} transition-all duration-500 ease-out`}
        ></div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {criteria.map((item, index) => (
          <div
            key={index}
            className={`flex items-center text-xs font-semibold transition-colors duration-300 ${
              item.met ? "text-green-500" : "text-muted/70"
            }`}
          >
            {item.met ? (
              <FaCheckCircle className="mr-2 text-sm scale-110 transition-transform" />
            ) : (
              <FaRegCircle className="mr-2 text-sm" />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordChecker;
