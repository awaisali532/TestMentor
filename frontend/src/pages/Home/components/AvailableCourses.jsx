import React from "react";
import fbise from "../../../assets/images/AvailableCourse/fbise-logo.png";
import pctb from "../../../assets/images/AvailableCourse/pctb-logo.png";
import SmartButton from "../../../components/ui/SmartButton";
import SectionHeader from "../../../components/ui/SectionHeader"; // ✅ Import added

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
    <section className="w-full py-12 lg:py-16 bg-bg-body transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* --- DYNAMIC HEADER --- */}
        <SectionHeader
          title="Select Your"
          highlightWord="Board"
          subtitle="Choose your board to access tailored study materials."
        />

        {/* --- COURSES GRID --- */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <div
              key={index}
              className={`group relative flex flex-col items-center text-center p-8 rounded-3xl border border-border transition-all duration-500 ease-out 
                ${
                  course.active
                    ? "bg-pill-bg/50 backdrop-blur-sm hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-1/10 hover:border-accent-1/50"
                    : "bg-bg-body opacity-70 grayscale"
                }
              `}
            >
              {/* Image Circle Box */}
              <div
                className={`size-28 rounded-full flex items-center justify-center p-4 mb-6 transition-transform duration-500 
                ${course.active ? "bg-main/5 group-hover:scale-110 group-hover:shadow-inner" : "bg-main/5"}
              `}
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Content */}
              <h3 className="text-2xl font-bold text-main mb-3">
                {course.title}
              </h3>
              <p className="text-muted mb-8 grow">{course.description}</p>

              {/* SMART BUTTON LOGIC */}
              {course.active ? (
                <SmartButton to={course.link} variant="solid">
                  Explore Subjects
                </SmartButton>
              ) : (
                <button
                  disabled
                  className="px-6 py-2.5 rounded-full font-semibold text-muted border border-muted/50 cursor-not-allowed bg-transparent"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableCourses;
