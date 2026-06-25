import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) => {
  const baseClasses =
    "px-5 py-2.5 rounded-md transition-all duration-300 ease-in-out hover:scale-105 inline-block font-medium";

  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-secondary text-white",
    danger: "bg-danger hover:bg-red-700 text-white",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
