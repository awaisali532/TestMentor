import React, { useEffect, useRef, useState } from "react";

const Reveal = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intersection Observer: Check karta hai element screen par kab aaya
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Ek dafa animate ho jaye toh observer hata do taa ke CPU free ho jaye
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  // Direction ke hisaab se initial position set karein
  const getTranslateClass = () => {
    if (isVisible) return "translate-y-0 translate-x-0";
    switch (direction) {
      case "up":
        return "translate-y-12"; // Neechay se upar
      case "left":
        return "translate-x-12"; // Right se left
      case "right":
        return "-translate-x-12"; // Left se right
      default:
        return "translate-y-12";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${getTranslateClass()}`}
      // Har card ko ek alag time par show karne ke liye delay
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;
