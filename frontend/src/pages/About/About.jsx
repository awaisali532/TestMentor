import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionHeader from "../../components/ui/SectionHeader";
import Reveal from "../../components/ui/Reveal";
import Loader from "../../components/ui/Loader";

// Imported Components
import MissionCards from "./components/MissionCards";
import DeveloperProfile from "./components/DeveloperProfile";

const About = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STALE-WHILE-REVALIDATE FETCHING (BEST PRACTICE) ---
  useEffect(() => {
    const fetchAdminProfile = async () => {
      // 1. Pehle Cache check karo
      const cachedData = sessionStorage.getItem("adminProfileData");

      if (cachedData) {
        // Agar cache hai, toh fauran show kar do (Loading screen nahi aayegi)
        setDeveloper(JSON.parse(cachedData));
        setLoading(false);
      }

      // 2. Background mein hamesha fresh data mangwao
      try {
        const res = await axios.get(`${BASE_URL}/api/users/admin-profile`);
        const freshData = res.data;

        // 3. Agar naya data cache wale data se mukhtalif hai, toh UI aur Cache dono update karo
        if (JSON.stringify(freshData) !== cachedData) {
          setDeveloper(freshData);
          sessionStorage.setItem("adminProfileData", JSON.stringify(freshData));
        }
      } catch (error) {
        console.error("Error fetching admin profile in background:", error);
      } finally {
        // Agar pehli dafa load ho raha hai (cache nahi tha), toh loading ab false karo
        if (!cachedData) {
          setLoading(false);
        }
      }
    };

    fetchAdminProfile();
  }, [BASE_URL]);
  if (loading) {
    return <Loader text="Fetching Developer Profile..." />;
  }

  return (
    <div className="min-h-screen bg-bg-body pt-18 pb-15 transition-colors duration-300">
      {/* 1. HERO SECTION */}
      <Reveal direction="up">
        <SectionHeader
          title="Innovating"
          highlightWord="Education"
          subtitle="We are on a mission to make self-assessment smarter, faster, and accessible to everyone."
        />
      </Reveal>

      {/* 2. MISSION CARDS COMPONENT */}
      <MissionCards />

      {/* 3. DEVELOPER PROFILE COMPONENT */}
      <DeveloperProfile developer={developer} />
    </div>
  );
};

export default About;
