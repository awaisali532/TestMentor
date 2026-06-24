import React from "react";
import { BsCpu, BsJournalText, BsGraphUp, BsPhone } from "react-icons/bs";
import "./WhyChoose.css";

const features = [
  {
    icon: <BsCpu />,
    title: "AI-Powered Study Tools",
    description:
      "Automatic paper generation and real-time answers using AI to make learning faster and smarter.",
  },
  {
    icon: <BsJournalText />,
    title: "Board-Wise Content",
    description:
      "Tailored study material for major boards like FBISE and PCTB, so you only see what’s relevant.",
  },
  {
    icon: <BsGraphUp />,
    title: "Smart Test Preparation",
    description:
      "Practice quizzes, mock exams, and performance tracking to boost your confidence before exams.",
  },
  {
    icon: <BsPhone />,
    title: "User-Friendly Design",
    description:
      "Clean, mobile-friendly interface that's easy for every student to use without any confusion.",
  },
];

const WhyChoose = () => {
  return (
    <section className="why-choose-section">
      <div className="container">
        {/* Header */}
        <div className="wc-header text-center">
          <h2 className="wc-title">
            Why Choose <span className="highlight-text">TestMentor?</span>
          </h2>
          <p className="wc-subtitle">
            Everything you need to ace your exams in one place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-12">
              <div className="wc-card">
                <div className="wc-icon-box">{feature.icon}</div>
                <div className="wc-content">
                  <h5 className="wc-feature-title">{feature.title}</h5>
                  <p className="wc-feature-desc">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
