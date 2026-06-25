import React from "react";
import heroImg from "../../../assets/images/HeroSection/hero-section.png";
import SmartButton from "../../../components/ui/SmartButton";

const HeroSection = () => {
  return (
    // Padding pt-20 se pt-12 aur lg:pt-30 se lg:pt-20 kar di gayi hai
    <section className="w-full bg-bg-body pt-12 pb-10 lg:pt-20 lg:pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* --- LEFT CONTENT --- */}
          <div className="w-full lg:w-1/2 flex flex-col text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-main leading-tight mb-6">
              Master Every Test With{" "}
              <span className="bg-linear-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>

            <p className="text-lg text-muted mb-8 max-w-2xl mx-auto lg:mx-0">
              Get access to all the tests and quizzes you need to ace your board
              exams for 9<sup>th</sup>, 10<sup>th</sup>, 1<sup>st</sup> & 2
              <sup>nd</sup> Year.
            </p>

            <div className="flex justify-center lg:justify-start">
              {/* ✅ Naya Reusable Component (By default gradient hi pick karega) */}
              <SmartButton to="/register">Get Started</SmartButton>
            </div>
          </div>

          {/* --- RIGHT IMAGE --- */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <img
              src={heroImg}
              alt="Student learning confidently"
              className="animate-float w-full max-w-md lg:max-w-lg object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700 ease-in-out"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
