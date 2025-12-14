import React from "react";
import HeroSection from "../../components/HeroSection/HeroSection";
import AvailableCourses from "../../components/AvailableCourse/AvailableCourse";
import WhyChoose from "../../components/WhyChoose/WhyChoose";
import RecommendedClasses from "../../components/RecommendedClasses/RecommendedClasses";
import Mediums from "../../components/Medium/Mediums";
import QuestionTypes from "../../components/QuestionsType/QuestionsType";
import Footer from "../../components/Footer/Footer";
import "./Home.css"; // Ensure this is imported

const Home = () => {
  return (
    <main className="home-wrapper">
      <HeroSection />
      <AvailableCourses />
      <WhyChoose />
      <RecommendedClasses />
      <Mediums />
      <QuestionTypes />
      <Footer />
    </main>
  );
};

export default Home;
