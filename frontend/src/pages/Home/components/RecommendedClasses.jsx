import React from "react";
import SectionHeader from "../../../components/ui/SectionHeader";
import Reveal from "../../../components/ui/Reveal"; // ✅ Import Added

const classes = [
  "9th & 10th",
  "FSc (Pre-Med)",
  "FSc (Pre-Eng)",
  "ICS",
  "I.COM",
  "F.A",
];

const RecommendedClasses = () => {
  return (
    <section className="w-full py-12 lg:py-16 bg-bg-body transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* --- DYNAMIC HEADER --- */}
        <Reveal direction="up">
          <SectionHeader
            title="Most Recommended"
            highlightWord="Classes"
            subtitle="Start your journey with our most popular study tracks."
          />
        </Reveal>

        {/* --- CLASSES WRAPPER --- */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 max-w-4xl mx-auto">
          {classes.map((className, index) => (
            <Reveal key={index} delay={index * 100} direction="up">
              <div className="group relative flex items-center justify-center min-w-35 sm:min-w-45 w-full sm:w-auto px-6 py-4 bg-pill-bg/50 backdrop-blur-md border border-border rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent-1/50 hover:bg-pill-bg hover:shadow-lg hover:shadow-accent-1/10">
                <span className="text-lg font-bold text-main transition-colors duration-300 group-hover:bg-linear-to-r group-hover:from-accent-1 group-hover:to-accent-2 group-hover:bg-clip-text group-hover:text-transparent">
                  {className}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedClasses;
