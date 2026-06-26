import React from "react";
import { Cpu, BookOpenText, TrendingUp, Smartphone } from "lucide-react";
import SectionHeader from "../../../components/ui/SectionHeader"; // ✅ Import added
import Reveal from "../../../components/ui/Reveal"; // ✅ Import Reveal Component
const features = [
  {
    icon: <Cpu size={30} strokeWidth={1.5} />,
    title: "AI-Powered Study Tools",
    description:
      "Automatic paper generation and real-time answers using AI to make learning faster and smarter.",
  },
  {
    icon: <BookOpenText size={30} strokeWidth={1.5} />,
    title: "Board-Wise Content",
    description:
      "Tailored study material for major boards like FBISE and PCTB, so you only see what’s relevant.",
  },
  {
    icon: <TrendingUp size={30} strokeWidth={1.5} />,
    title: "Smart Test Preparation",
    description:
      "Practice quizzes, mock exams, and performance tracking to boost your confidence before exams.",
  },
  {
    icon: <Smartphone size={30} strokeWidth={1.5} />,
    title: "User-Friendly Design",
    description:
      "Clean, mobile-friendly interface that's easy for every student to use without any confusion.",
  },
];

const WhyChoose = () => {
  return (
    <section className="w-full py-12 lg:py-16 bg-bg-body transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header par bhi animation laga di */}
        <Reveal direction="up">
          <SectionHeader
            title="Why Choose"
            highlightWord="TestMentor?"
            subtitle="Everything you need to ace your exams in one place."
          />
        </Reveal>

        {/* --- FEATURES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            /* ✅ Har card ko Reveal mein wrap kar diya aur thora sa delay de diya */
            <Reveal key={index} delay={index * 150} direction="up">
              <div className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 p-6 rounded-3xl border border-transparent hover:border-border hover:bg-pill-bg/50 hover:shadow-lg hover:shadow-accent-1/5 transition-all duration-300 ease-out hover:-translate-y-1 h-full">
                {/* Icon Box */}
                <div className="shrink-0 size-16 flex items-center justify-center rounded-2xl bg-main/5 text-accent-1 transition-all duration-300 ease-out group-hover:bg-linear-to-br group-hover:from-accent-1 group-hover:to-accent-2 group-hover:text-white group-hover:shadow-md">
                  {feature.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-main mb-2 transition-colors duration-300 group-hover:text-accent-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
export default WhyChoose;
