import React from "react";
import "./Mediums.css";

const mediums = ["English Medium", "Urdu Medium", "Both Medium"];

const Mediums = () => {
  return (
    <section className="mediums-section">
      <div className="container">
        {/* Header */}
        <div className="mediums-header text-center">
          <h2 className="mediums-title">
            Select <span className="highlight-text">Medium</span>
          </h2>
          <p className="mediums-subtitle">
            Choose your preferred language for study materials.
          </p>
        </div>

        {/* Mediums Grid */}
        <div className="d-flex flex-wrap justify-content-center gap-4 mediums-wrapper">
          {mediums.map((medium, index) => (
            <div className="medium-card-glass" key={index}>
              <span className="medium-text">{medium}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mediums;
