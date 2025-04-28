import React from "react";
import { Link } from "react-router-dom"; // If you plan to use React Router for navigation
import "./HeroSection.css"; // External CSS for customization
import heroImg from "../../assets/imeages/HeroSection/hero-section.png"; // Importing image
const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Section */}
          <div className="col-md-6">
            <div className="hero-left">
              <h1 className="hero-heading">
                Master Every Test With Confidence
              </h1>
              <p className="hero-description">
                Get access of all the tests and quizzes you need to ace your
                board exams 9<sup>th</sup>,10<sup>th</sup>, 1<sup>st</sup> & 2
                <sup>nd</sup> year.
              </p>
              <Link to={"/register"} className="button-primary">
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-md-6">
            <div className="hero-right">
              <img
                src={heroImg} // Placeholder image
                alt="Hero"
                className="img-fluid hero-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
