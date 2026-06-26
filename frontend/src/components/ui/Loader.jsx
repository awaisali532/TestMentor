import React from "react";

// ✅ 'fullScreen' prop add kiya hai. Default false hai.
const Loader = ({ text = "Loading...", fullScreen = false }) => {
  // Agar fullScreen true hai toh 'fixed' class poori screen gher legi (Navbar ke upar bhi aa jayegi)
  // Agar false hai toh normal page ke andar rahegi
  const containerStyle = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-body/80 backdrop-blur-lg"
    : "flex flex-col items-center justify-center min-h-[60vh] w-full bg-bg-body/60 backdrop-blur-md z-10 transition-all duration-300";

  return (
    <div className={containerStyle}>
      <div className="relative flex items-center justify-center size-28 mb-6">
        {/* 1. Background Light Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-accent-1/20"></div>

        {/* 2. Spinning Glowing Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-accent-1 border-t-transparent animate-spin shadow-lg shadow-accent-1/40"></div>

        {/* 3. Center Logo (Static) */}
        <div className="size-20 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center p-2 z-10 shadow-inner border border-border/50">
          <img
            src="/favicon/apple-touch-icon.png"
            alt="TestMentor Logo"
            className="size-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* 4. Dynamic Pulsing Text */}
      <p className="text-xl font-extrabold text-main animate-pulse tracking-wider drop-shadow-md">
        {text}
      </p>
    </div>
  );
};

export default Loader;
