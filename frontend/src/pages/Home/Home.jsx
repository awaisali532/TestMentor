import React from "react";
import HeroSection from "../../components/HeroSection/HeroSection";
import AvailableCourses from "../../components/AvailableCourse/AvailableCourse";
import WhyChoose from "../../components/WhyChoose/WhyChoose";
import RecommendedClasses from "../../components/RecommendedClasses/RecommendedClasses";
import Mediums from "../../components/Medium/Mediums";
import QuestionTypes from "../../components/QuestionsType/QuestionsType";
import Footer from "../../components/Footer/Footer";
const Home = () => {
  return (
    <div>
      <HeroSection />
      <AvailableCourses />
      <WhyChoose />
      <RecommendedClasses />
      <Mediums />
      <QuestionTypes />
      <Footer />
    </div>
  );
};

export default Home;
