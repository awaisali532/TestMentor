import React from "react";

// ✅ HeroSection ka import theek kar diya gaya hai
import HeroSection from "./components/HeroSection";
import AvailableCourses from "./components/AvailableCourses";
import WhyChoose from "./components/WhyChoose";
import RecommendedClasses from "./components/RecommendedClasses";
// import Mediums from "./components/Medium/Mediums";
// import QuestionTypes from "./components/QuestionsType/QuestionsType";
// import Footer from "../../components/layout/Footer/Footer";

const Home = () => {
  return (
    // 🛑 Yahan se py-20 aur justify-center hata diya hai taa ke extra gap khatam ho jaye
    <main className="w-full flex flex-col">
      <HeroSection />

      <AvailableCourses />
      <WhyChoose />
      <RecommendedClasses />
      {/* <Mediums /> */}
      {/* <QuestionTypes /> */}
      {/* <Footer /> */}
    </main>
  );
};

export default Home;
