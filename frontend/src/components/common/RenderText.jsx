import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const RenderText = ({ text }) => {
  if (!text) return null;

  // Split text by $ to separate English/Urdu from Math
  const parts = text.split("$");

  return (
    <span>
      {parts.map((part, index) => {
        // Even Index = Normal Text (English or Urdu)
        if (index % 2 === 0) {
          // ✅ UPDATE: dangerouslySetInnerHTML use karein taake <u> aur <b> tags work karein
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
            />
          );
        }
        // Odd Index = Math (Always Force LTR)
        else {
          try {
            const html = katex.renderToString(part, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{
                  margin: "0 4px",
                  direction: "ltr",
                  unicodeBidi: "isolate",
                  display: "inline-block",
                }}
              />
            );
          } catch (error) {
            return (
              <span key={index} style={{ color: "red" }}>{`$${part}$`}</span>
            );
          }
        }
      })}
    </span>
  );
};

export default RenderText;
