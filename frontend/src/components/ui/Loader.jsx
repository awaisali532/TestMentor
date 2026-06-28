import React from "react";

const Loader = ({ text = "Loading...", fullScreen = false }) => {
  // ✅ FIX: 'bg-transparent' use kiya hai. Ab peeche koi andhera ya blur nahi hoga,
  // sab kuch 100% clear nazar aayega. 'fixed inset-0' sirf clicks ko block karne ke liye hai.
  const containerStyle = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent"
    : "flex flex-col items-center justify-center min-h-[60vh] w-full bg-transparent z-10 transition-all duration-300";

  return (
    <div className={containerStyle}>
      <div className="relative flex items-center justify-center size-28 mb-6">
        {/* 1. Background Light Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-accent-1/20"></div>

        {/* 2. Spinning Glowing Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-accent-1 border-t-transparent animate-[spin_0.7s_linear_infinite] shadow-lg shadow-accent-1/40"></div>

        {/* 3. Center Logo (Static) */}
        <div className="size-20 rounded-full bg-card flex items-center justify-center p-2 z-10 shadow-inner border border-border/50">
          <img
            src="/favicon/apple-touch-icon.png"
            alt="TestMentor Logo"
            className="size-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* 4. Dynamic Pulsing Text */}
      <p className="text-xl font-extrabold animate-pulse tracking-wider drop-shadow-lg text-main">
        {text}
      </p>
    </div>
  );
};

export default Loader;
