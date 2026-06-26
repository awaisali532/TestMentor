import React from "react";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import Reveal from "../../../components/ui/Reveal";

const ContactForm = ({ formData, handleChange, handleSubmit, loading }) => {
  // Common input classes directly using Tailwind v4 (No custom CSS needed)
  const inputStyle =
    "w-full bg-bg-body border border-border text-main px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-1/50 focus:border-accent-1 transition-all duration-300 placeholder:text-muted/60";
  const labelStyle = "block font-semibold text-main text-sm mb-2";

  return (
    <Reveal direction="up" delay={200}>
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
        <h3 className="text-2xl font-extrabold text-main mb-8">
          Send us a message
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Your Name</label>
              <input
                type="text"
                name="name"
                className={inputStyle}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelStyle}>Your Email</label>
              <input
                type="email"
                name="email"
                className={inputStyle}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Subject</label>
            <input
              type="text"
              name="subject"
              className={inputStyle}
              placeholder="How can we help?"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelStyle}>Message</label>
            <textarea
              name="message"
              rows="5"
              className={`${inputStyle} resize-none`}
              placeholder="Leave us a message..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-1/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-lg" /> Sending...
              </>
            ) : (
              <>
                <FaPaperPlane /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </Reveal>
  );
};

export default ContactForm;
