import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const RenderText = ({ text }) => {
  if (!text) return null;

  // Safety: Ensure text is a string
  const safeText = String(text);

  // Split text by $ to separate English/Urdu from Math
  const parts = safeText.split("$");

  return (
    <span>
      {parts.map((part, index) => {
        // --- Even Index = Normal Text (English or Urdu) ---
        if (index % 2 === 0) {
          // ✅ Detect Urdu Characters (Unicode Range)
          const isUrdu = /[\u0600-\u06FF]/.test(part);

          return (
            <span
              key={index}
              // ✅ Agar Urdu hai to RTL lagao, CSS font khud utha legi
              dir={isUrdu ? "rtl" : "ltr"}
              className={isUrdu ? "urdu-font" : ""}
              dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
            />
          );
        }

        // --- Odd Index = Math (Always Force LTR) ---
        else {
          try {
            const html = katex.renderToString(part, {
              throwOnError: false,
              displayMode: false,
              strict: false, // ✅ Warning Suppressed
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
