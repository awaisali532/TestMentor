import React from "react";

const SectionHeader = ({ title, highlightWord, subtitle }) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-10">
      <h2 className="text-3xl md:text-4xl lg:text-4xl font-extrabold text-main mb-4 leading-tight">
        {title}{" "}
        {highlightWord && (
          <span className="bg-linear-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
            {highlightWord}
          </span>
        )}
      </h2>
      {subtitle && <p className="text-lg text-muted">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
