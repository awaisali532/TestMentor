import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AuthInput = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  name,
  required = true,
  helpText,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-5">
      <div className="flex items-center bg-bg-body border border-border rounded-xl focus-within:border-accent-1 focus-within:ring-2 focus-within:ring-accent-1/20 transition-all duration-300 overflow-hidden">
        {/* Icon Box */}
        <div className="pl-4 pr-3 py-3.5 text-muted bg-pill-bg border-r border-border/50">
          <Icon size={18} />
        </div>

        {/* Input Field */}
        <input
          type={currentType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent text-main px-4 py-3.5 outline-none placeholder:text-muted/60 text-sm font-medium"
        />

        {/* Show/Hide Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 pl-3 py-3.5 text-muted hover:text-accent-1 transition-colors cursor-pointer bg-transparent border-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>

      {/* Helper Text (e.g., password hints) */}
      {helpText && <p className="text-xs text-muted mt-2 ml-1">{helpText}</p>}
    </div>
  );
};

export default AuthInput;
