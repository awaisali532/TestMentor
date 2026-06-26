import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll position monitor karne ke liye
  useEffect(() => {
    const toggleVisibility = () => {
      // Agar user 300px se zyada neechay aa jaye toh button show karo
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Top par wapis le jane ka function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Agar top par hain toh kuch render mat karo
  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-linear-to-r from-accent-1 to-accent-2 text-white shadow-lg hover:scale-110 hover:shadow-accent-1/50 transition-all duration-300 animate-bounce"
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTop;
