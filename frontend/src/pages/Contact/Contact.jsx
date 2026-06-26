import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SectionHeader from "../../components/ui/SectionHeader";
import Reveal from "../../components/ui/Reveal";
import Loader from "../../components/ui/Loader"; // ✅ Custom Loader Import
import useUnsavedChanges from "../../hooks/useUnsavedChanges"; // ✅ Global Hook Import

// Components
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";

const Contact = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // --- CONTACT INFO STATE ---
  const [contactInfo, setContactInfo] = useState({
    phone: "Loading...",
    address: "Loading...",
    email: "Loading...",
  });

  // --- SWR FETCHING FOR CONTACT INFO ---
  useEffect(() => {
    const fetchInfo = async () => {
      const cachedData = sessionStorage.getItem("adminContactInfo");
      if (cachedData) setContactInfo(JSON.parse(cachedData));

      try {
        const res = await axios.get(`${BASE_URL}/api/users/admin-profile`);
        if (res.data.businessInfo) {
          const freshInfo = {
            phone: res.data.businessInfo.phone,
            address: res.data.businessInfo.officeAddress,
            email: res.data.businessInfo.supportEmail,
          };
          if (JSON.stringify(freshInfo) !== cachedData) {
            setContactInfo(freshInfo);
            sessionStorage.setItem(
              "adminContactInfo",
              JSON.stringify(freshInfo),
            );
          }
        }
      } catch (err) {
        console.error("Failed to load contact info in background", err);
        if (!cachedData) {
          setContactInfo({
            phone: "+92 300 1234567",
            address: "Lahore, Pakistan",
            email: "support@testmentor.com",
          });
        }
      }
    };
    fetchInfo();
  }, [BASE_URL]);

  // --- FORM GUARD LOGIC ---
  // Agar kisi bhi field mein kuch likha hai, toh isDirty true ho jayega
  const isDirty =
    formData.name !== "" ||
    formData.email !== "" ||
    formData.subject !== "" ||
    formData.message !== "";
  useUnsavedChanges(isDirty); // ✅ Hook active ho gaya!

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all required fields.");
    }

    setLoading(true); // ✅ Hamara full-screen loader trigger hoga

    try {
      const res = await axios.post(`${BASE_URL}/api/contact`, formData);
      if (res.data.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" }); // Reset hone par isDirty false ho jayega
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message.");
    } finally {
      setLoading(false); // ✅ Loader khatam
    }
  };

  return (
    <>
      {/* ✅ Jab form submit ho raha ho, toh ye full-screen overlay sab kuch block kar dega */}
      {loading && <Loader fullScreen={true} text="Sending your message..." />}

      <div className="min-h-screen bg-bg-body pt-18 pb-15 transition-colors duration-300">
        <Reveal direction="up">
          <SectionHeader
            title="Get in"
            highlightWord="Touch"
            subtitle="Have questions about our test platform? We're here to help."
          />
        </Reveal>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <ContactInfo info={contactInfo} />
            </div>

            <div className="lg:col-span-7">
              <ContactForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading} // Bhejne ke doran button ko disable rakhne ke liye
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
