import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import "./HeroSection.css";
import heroImg from "../../assets/imeages/HeroSection/hero-section.png";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
            <div className="hero-left">
              <h1 className="hero-heading">
                Master Every Test With{" "}
                <span className="highlight-text">Confidence</span>
              </h1>
              <p className="hero-description">
                Get access to all the tests and quizzes you need to ace your
                board exams for 9<sup>th</sup>, 10<sup>th</sup>, 1<sup>st</sup>{" "}
                & 2<sup>nd</sup> Year.
              </p>

              <div className="hero-actions">
                {/* ✅ New Tarka Button */}
                <Link to="/register" className="hero-btn-smart">
                  <span className="btn-text-hero">Get Started</span>
                  <span className="icon-wrapper">
                    <FaArrowRight />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-7 col-md-12">
            <div className="hero-right">
              <img
                src={heroImg}
                alt="Student learning online"
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
