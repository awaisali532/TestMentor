import React from "react";
import "./Mediums.css";

const mediums = ["English Medium", "Urdu Medium", "Both Medium"];

const RecommendedClasses = () => {
  return (
    <div className="container text-center my-4">
      <h1 className="section-title mb-4">Most Recommended Classes</h1>
      <div className="d-flex flex-wrap justify-content-center gap-3 recommended-wrapper">
        {mediums.map((className, index) => (
          <div className="medium-card" key={index}>
            <strong>{className}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedClasses;
