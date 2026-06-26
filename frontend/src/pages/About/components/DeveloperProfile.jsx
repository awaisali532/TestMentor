import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaFilePdf,
  FaCode,
  FaQuoteLeft,
  FaUserSecret,
} from "react-icons/fa";
import Reveal from "../../../components/ui/Reveal";

const DeveloperProfile = ({ developer }) => {
  if (!developer) return null;

  const handleViewResume = () => {
    if (!developer.resume) return;
    let url = developer.resume;
    if (url.includes("/upload/") && !url.toLowerCase().endsWith(".pdf")) {
      url = url + ".pdf";
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="max-w-6xl mx-auto px-6 lg:px-8">
      <Reveal direction="up" delay={200}>
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 lg:p-14 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Image Section */}
            <div className="shrink-0 relative group">
              <div className="size-64 lg:size-72 rounded-full p-2 bg-linear-to-br from-accent-1 to-accent-2 shadow-xl shadow-accent-1/20 transition-transform duration-500 group-hover:scale-105">
                {developer.image ? (
                  <img
                    src={developer.image}
                    alt={developer.name}
                    className="size-full object-cover rounded-full border-4 border-card bg-bg-body"
                  />
                ) : (
                  <div className="size-full rounded-full border-4 border-card bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                    <FaUserSecret size={80} className="text-white/50" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 right-0 bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg border-2 border-card">
                <FaCode className="text-accent-2" /> <span>Dev</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="text-center lg:text-left grow">
              <span className="uppercase text-xs tracking-widest font-bold text-accent-1 mb-3 block">
                Lead Developer
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-main mb-6">
                Meet{" "}
                <span className="bg-linear-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
                  {developer.name}
                </span>
              </h2>

              <div className="ml-1 relative pl-6 lg:pl-8 border-l-4 border-accent-1 mb-8">
                <FaQuoteLeft className="absolute -top-2 left-2 text-border text-3xl opacity-50" />
                <p className="text-lg text-muted italic relative z-10 leading-relaxed">
                  {developer.bio ||
                    "Passionate about building scalable web applications and creating intuitive user experiences."}
                </p>
              </div>

              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <div className="flex gap-4">
                  <a
                    href="https://github.com/awaisali532"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-12 rounded-full bg-pill-bg border border-border text-muted flex items-center justify-center text-xl transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-800 hover:text-white hover:border-transparent hover:shadow-lg"
                  >
                    <FaGithub />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/awais-ali-080a61332/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-12 rounded-full bg-pill-bg border border-border text-muted flex items-center justify-center text-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:text-white hover:border-transparent hover:shadow-lg"
                  >
                    <FaLinkedin />
                  </a>
                  <a
                    href="mailto:awaisali532193@gmail.com"
                    className="size-12 rounded-full bg-pill-bg border border-border text-muted flex items-center justify-center text-xl transition-all duration-300 hover:-translate-y-1 hover:bg-red-500 hover:text-white hover:border-transparent hover:shadow-lg"
                  >
                    <FaEnvelope />
                  </a>
                </div>
                <div className="hidden sm:block w-px h-8 bg-border"></div>
                {developer.resume && (
                  <button
                    onClick={handleViewResume}
                    className="px-8 py-3 rounded-full bg-linear-to-r from-accent-1 to-accent-2 text-white font-bold flex items-center gap-2 shadow-lg shadow-accent-1/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-accent-1/40 hover:brightness-110 cursor-pointer"
                  >
                    <FaFilePdf /> View Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default DeveloperProfile;
