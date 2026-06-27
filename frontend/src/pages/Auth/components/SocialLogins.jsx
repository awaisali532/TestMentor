import React from "react";
import toast from "react-hot-toast";
import { FaFacebookF, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const SocialLogins = ({ text = "Or continue with" }) => {
  const handleSocialClick = () => {
    toast("Social login is currently under development.", {
      icon: "🚧",
      style: {
        borderRadius: "10px",
        background: "var(--color-card)",
        color: "var(--color-main)",
      },
    });
  };

  return (
    <div className="mt-8 text-center">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60"></div>
        </div>
        <span className="relative px-4 text-sm text-muted bg-card">{text}</span>
      </div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={handleSocialClick}
          className="size-12 rounded-full border border-border bg-pill-bg flex items-center justify-center text-xl hover:-translate-y-1 hover:border-accent-1 transition-all duration-300 cursor-pointer shadow-sm"
        >
          <FcGoogle />
        </button>
        <button
          type="button"
          onClick={handleSocialClick}
          className="size-12 rounded-full border border-border bg-pill-bg flex items-center justify-center text-xl text-[#1877f2] hover:-translate-y-1 hover:border-accent-1 transition-all duration-300 cursor-pointer shadow-sm"
        >
          <FaFacebookF />
        </button>
        <button
          type="button"
          onClick={handleSocialClick}
          className="size-12 rounded-full border border-border bg-pill-bg flex items-center justify-center text-xl text-main hover:-translate-y-1 hover:border-accent-1 transition-all duration-300 cursor-pointer shadow-sm"
        >
          <FaGithub />
        </button>
      </div>
    </div>
  );
};

export default SocialLogins;
