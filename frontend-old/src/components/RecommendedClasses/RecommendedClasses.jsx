import React from "react";
import "./RecommendedClasses.css";
// import "bootstrap/dist/css/bootstrap.min.css"; // Not needed if already imported in App.js

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
    <section className="recommended-section">
      <div className="container">
        {/* Header */}
        <div className="rc-header text-center">
          <h2 className="rc-title">
            Most Recommended <span className="highlight-text">Classes</span>
          </h2>
          <p className="rc-subtitle">
            Start your journey with our most popular study tracks.
          </p>
        </div>

        {/* Classes Grid */}
        <div className="d-flex flex-wrap justify-content-center gap-4 rc-wrapper">
          {classes.map((className, index) => (
            <div className="class-card-glass" key={index}>
              <span className="class-text">{className}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedClasses;
