import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import "./AvailableCourse.css";
import fbise from "../../assets/imeages/AvailableCourse/fbise-logo.png";
import pctb from "../../assets/imeages/AvailableCourse/pctb-logo.png";

const AvailableCourses = () => {
  const courses = [
    {
      image: pctb,
      title: "Punjab Board (PTB)",
      description: "Complete preparation for 9th to 12th grade.",
      link: "/subjects",
      active: true,
    },
    {
      image: fbise,
      title: "Federal Board",
      description: "Coming Soon",
      link: "#",
      active: false,
    },
  ];

  return (
    <section className="courses-section">
      <div className="container">
        {/* ✅ Renamed Classes to avoid conflict */}
        <div className="courses-header text-center mb-5">
          <h2 className="courses-title-main">
            Select Your <span className="highlight-text">Board</span>
          </h2>
          <p className="courses-subtitle">
            Choose your board to access tailored study materials.
          </p>
        </div>

        <div className="row justify-content-center g-4">
          {courses.map((course, index) => (
            <div key={index} className="col-md-5 col-sm-8 col-12">
              <div
                className={`custom-course-card ${
                  !course.active ? "disabled" : ""
                }`}
              >
                <div className="card-img-box">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="course-logo"
                  />
                </div>

                <div className="card-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>

                  {course.active ? (
                    <Link to={course.link} className="course-btn">
                      Explore Subjects <FaArrowRight className="ms-2" />
                    </Link>
                  ) : (
                    <button className="course-btn disabled-btn" disabled>
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableCourses;
