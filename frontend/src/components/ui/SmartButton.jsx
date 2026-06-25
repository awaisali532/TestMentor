import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SmartButton = ({
  to,
  children,
  variant = "gradient",
  className = "",
}) => {
  // Base classes jo dono variants par apply hongi
  const baseStyles =
    "group relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-50 ease-out hover:rounded-xl hover:-translate-y-1 overflow-hidden";

  // Variant ke hisaab se styles (Hero ke liye gradient, Navbar ke liye solid)
  const variants = {
    gradient:
      "px-8 py-3.5 text-lg bg-linear-to-r from-accent-1 to-accent-2 text-white hover:shadow-[0_10px_25px_rgba(14,165,233,0.4)]",
    solid:
      "px-5 py-2 text-sm bg-main text-bg-body border border-main hover:shadow-lg",
  };

  return (
    <Link to={to} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {/* Background Hover Animation (Sirf Gradient wale ke liye) */}
      {variant === "gradient" && (
        <div className="absolute inset-0 w-full h-full bg-linear-to-r from-accent-2 to-accent-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}

      <span className="relative z-10 whitespace-nowrap">{children}</span>

      {/* Synchronized Arrow Animation */}
      <span className="relative z-10 flex items-center max-w-0 opacity-0 -translate-x-3 group-hover:max-w-xs group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2 transition-all duration-300 ease-out">
        <ArrowRight size={variant === "gradient" ? 20 : 16} strokeWidth={3} />
      </span>
    </Link>
  );
};

export default SmartButton;
