import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const RenderText = ({ text }) => {
  if (!text) return null;

  const safeText = String(text);
  const parts = safeText.split("$");

  return (
    <span>
      {parts.map((part, index) => {
        // Even Index = Normal Text (English or Urdu)
        if (index % 2 === 0) {
          const isUrdu = /[\u0600-\u06FF]/.test(part);
          return (
            <span
              key={index}
              dir={isUrdu ? "rtl" : "ltr"}
              className={`${isUrdu ? "font-[Jameel_Noori_Nastaleeq] text-lg leading-loose" : "font-sans"} wrap-break-word whitespace-pre-wrap`}
              dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
            />
          );
        }

        // Odd Index = Math Formulas
        else {
          try {
            const html = katex.renderToString(part, {
              throwOnError: false,
              displayMode: false,
              strict: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className="mx-1 inline-block"
                style={{ direction: "ltr", unicodeBidi: "isolate" }}
              />
            );
          } catch (error) {
            return (
              <span key={index} className="text-red-500">{`$${part}$`}</span>
            );
          }
        }
      })}
    </span>
  );
};

export default RenderText;
