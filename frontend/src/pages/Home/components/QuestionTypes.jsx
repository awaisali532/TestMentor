import React from "react";
import SectionHeader from "../../../components/ui/SectionHeader";
import Reveal from "../../../components/ui/Reveal"; // ✅ Import Added
import { CheckCircle2 } from "lucide-react";

const questionTypes = [
  "Text / Theory",
  "Exercise Questions",
  "Numerical Problems",
  "Review Questions",
  "Conceptual Questions",
  "Example Questions",
];

const QuestionTypes = () => {
  return (
    <section className="w-full py-8 lg:py-12 bg-bg-body transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* --- DYNAMIC HEADER --- */}
        <Reveal direction="up">
          <SectionHeader
            title="Included"
            highlightWord="Question Types"
            subtitle="We cover every type of question to ensure 100% preparation."
          />
        </Reveal>

        {/* --- GRID / WRAPPER --- */}
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {questionTypes.map((type, index) => (
            <Reveal key={index} delay={index * 100} direction="up">
              <div className="group relative flex flex-row sm:flex-col items-center sm:justify-center justify-start w-full sm:w-44 lg:w-48 p-4 sm:p-6 gap-4 sm:gap-3 bg-pill-bg/50 backdrop-blur-md border border-border rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent-1/50 hover:bg-pill-bg hover:shadow-lg hover:shadow-accent-1/10 h-full">
                {/* Icon (Green on hover) */}
                <CheckCircle2
                  className="size-6 sm:size-8 text-accent-1 group-hover:text-green-500 transition-colors duration-300 shrink-0"
                  strokeWidth={2}
                />

                {/* Text */}
                <span className="text-base sm:text-sm font-semibold text-main text-left sm:text-center leading-snug">
                  {type}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuestionTypes;
