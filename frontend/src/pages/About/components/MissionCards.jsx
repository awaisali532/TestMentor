import React from "react";
import { FaLightbulb, FaRocket, FaCode } from "react-icons/fa";
import Reveal from "../../../components/ui/Reveal";

const MissionCards = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Reveal delay={100} direction="up">
          <div className="group bg-card/50 backdrop-blur-md border border-border rounded-3xl p-8 text-center h-full transition-all duration-300 hover:-translate-y-2 hover:border-accent-1/50 hover:shadow-2xl hover:shadow-accent-1/10">
            <div className="size-20 mx-auto rounded-full bg-linear-to-br from-accent-1 to-accent-2 text-white flex items-center justify-center text-3xl mb-6 shadow-lg shadow-accent-1/30 group-hover:scale-110 transition-transform duration-300">
              <FaLightbulb />
            </div>
            <h3 className="text-xl font-bold text-main mb-4">Our Vision</h3>
            <p className="text-muted leading-relaxed">
              To empower students with AI-driven tools that make exam
              preparation effortless and effective.
            </p>
          </div>
        </Reveal>

        <Reveal delay={200} direction="up">
          <div className="group bg-card/50 backdrop-blur-md border border-border rounded-3xl p-8 text-center h-full transition-all duration-300 hover:-translate-y-2 hover:border-accent-1/50 hover:shadow-2xl hover:shadow-accent-1/10">
            <div className="size-20 mx-auto rounded-full bg-linear-to-br from-accent-1 to-accent-2 text-white flex items-center justify-center text-3xl mb-6 shadow-lg shadow-accent-1/30 group-hover:scale-110 transition-transform duration-300">
              <FaRocket />
            </div>
            <h3 className="text-xl font-bold text-main mb-4">Our Mission</h3>
            <p className="text-muted leading-relaxed">
              Providing a seamless platform for generating papers, taking tests,
              and tracking progress in real-time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={300} direction="up">
          <div className="group bg-card/50 backdrop-blur-md border border-border rounded-3xl p-8 text-center h-full transition-all duration-300 hover:-translate-y-2 hover:border-accent-1/50 hover:shadow-2xl hover:shadow-accent-1/10">
            <div className="size-20 mx-auto rounded-full bg-linear-to-br from-accent-1 to-accent-2 text-white flex items-center justify-center text-3xl mb-6 shadow-lg shadow-accent-1/30 group-hover:scale-110 transition-transform duration-300">
              <FaCode />
            </div>
            <h3 className="text-xl font-bold text-main mb-4">The Tech</h3>
            <p className="text-muted leading-relaxed">
              Built on the robust MERN Stack (MongoDB, Express, React, Node.js)
              for speed and reliability.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MissionCards;
