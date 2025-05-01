import React from "react";
import HeroSection from "../../components/HeroSection/HeroSection";
import AvailableCourses from "../../components/AvailableCourse/AvailableCourse";
import WhyChoose from "../../components/WhyChoose/WhyChoose";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <AvailableCourses />
      <WhyChoose />
    </div>
  );
};

export default Home;
