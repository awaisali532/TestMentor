import React from "react";
import "./RecommendedClasses.css";
import "bootstrap/dist/css/bootstrap.min.css";

const classes = ["9ᵗʰ , 10ᵗʰ", "FSc", "ICS", "I.COM", "F.A"];

const RecommendedClasses = () => {
  return (
    <div className="container text-center my-4">
      <h1 className="section-title mb-4">Most Recommended Classes</h1>
      <div className="d-flex flex-wrap justify-content-center gap-3 recommended-wrapper">
        {classes.map((className, index) => (
          <div className="class-card-home" key={index}>
            <strong>{className}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedClasses;
