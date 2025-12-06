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
          return <span key={index}>{part}</span>;
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
                // 👇 THIS CSS IS THE FIX FOR URDU MATH ISSUES
                style={{
                  margin: "0 4px",
                  direction: "ltr", // Force Left-to-Right
                  unicodeBidi: "isolate", // Isolate it from Urdu text flow
                  display: "inline-block", // Keeps it stable
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
