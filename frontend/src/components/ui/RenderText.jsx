import React, { memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// In-Memory Global KaTeX Cache (0ms Instant Lookup - Prevents UI Hang)
const katexCache = new Map();

const getKatexHtml = (formula) => {
  if (katexCache.has(formula)) {
    return katexCache.get(formula);
  }
  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode: false,
      strict: false,
    });
    katexCache.set(formula, html);
    return html;
  } catch (error) {
    const fallback = `<span class="text-red-500">$${formula}$</span>`;
    katexCache.set(formula, fallback);
    return fallback;
  }
};

const RenderText = memo(({ text }) => {
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
              className={`${
                isUrdu
                  ? "font-[Jameel_Noori_Nastaleeq] text-lg leading-loose"
                  : "font-sans"
              } wrap-break-word whitespace-pre-wrap`}
              dangerouslySetInnerHTML={{
                __html: part.replace(/\n/g, "<br/>"),
              }}
            />
          );
        }

        // Odd Index = Math Formulas (0ms Cache Lookup)
        else {
          const html = getKatexHtml(part);
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className="mx-1 inline-block math-jax-output"
              style={{ direction: "ltr", unicodeBidi: "isolate" }}
            />
          );
        }
      })}
    </span>
  );
});

export default RenderText;
