import React, { forwardRef } from "react";
import ExamHeader from "./ExamHeader";
import AnswerKey from "./AnswerKey";
import PaperPreview from "../../../../pages/User/PaperMaker/components/PaperPreview/PaperPreview";

const PrintableSheet = forwardRef(
  ({ paperData, settings, instituteInfo, isDual }, ref) => {
    // Height ko thora maintain rakha hai taake paper jaisa feel aaye
    const getPaperMinHeight = () => {
      if (isDual) {
        if (settings.paperSize === "legal" || settings.paperSize === "letter")
          return "min-h-[216mm]";
        return "min-h-[210mm]";
      } else {
        if (settings.paperSize === "legal") return "min-h-[356mm]";
        if (settings.paperSize === "letter") return "min-h-[279mm]";
        return "min-h-[297mm]";
      }
    };

    const ThePaperContent = () => (
      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="relative z-10 flex-1">
          <ExamHeader
            paperData={paperData}
            settings={settings}
            institute={instituteInfo}
          />
          <div className="mt-4">
            <PaperPreview paperData={paperData} isPrintMode={true} />
          </div>
        </div>
        {settings.showAnswerKey && (
          <div className="mt-10 break-before-page pt-4 border-t border-dashed border-black">
            <AnswerKey paperData={paperData} />
          </div>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        // ✅ FULL SCREEN WIDTH FIX: w-[210mm] ki jagah w-full laga diya hai
        className={`bg-white text-black shadow-2xl mx-auto relative overflow-visible box-border print:m-0 print:p-0 print:w-full print:shadow-none print:bg-transparent w-full ${getPaperMinHeight()} print-wrapper-scope`}
        style={{
          color: settings.fontColor,
          fontWeight: settings.fontWeight,
        }}
      >
        <style>{`
        .print-wrapper-scope {
          line-height: ${settings.lineHeight};
        }
        .print-wrapper-scope .pp-text-en {
          font-size: ${settings.engFontSize}px;
        }
        .print-wrapper-scope .pp-text-ur {
          font-size: ${settings.urduFontSize}px;
        }
        .print-wrapper-scope .math-jax-output,
        .print-wrapper-scope .katex,
        .print-wrapper-scope .MathJax {
          font-size: ${settings.eqFontSize}px !important;
        }
      `}</style>
        {settings.watermark === "logo" && instituteInfo.logo && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0">
            <img
              src={instituteInfo.logo}
              alt="Watermark"
              className="w-100 h-100 object-contain grayscale"
            />
          </div>
        )}

        {settings.watermark === "confidential" && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0 overflow-hidden">
            <h1 className="text-[4rem] font-bold uppercase -rotate-45 text-center leading-none whitespace-nowrap">
              {instituteInfo.name}
            </h1>
          </div>
        )}

        {isDual ? (
          <div className="flex w-full h-full">
            <div className="w-[48%] p-[10mm] border-r border-dashed border-slate-400 print:border-black flex flex-col relative">
              <ThePaperContent />
            </div>
            <div className="w-[4%] flex justify-center relative print:hidden">
              <span className="absolute top-12.5 bg-white px-1 text-slate-500 text-xl z-20">
                ✂
              </span>
            </div>
            <div className="w-[48%] p-[10mm] flex flex-col relative">
              <ThePaperContent />
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-[12mm] flex flex-col relative">
            <ThePaperContent />
          </div>
        )}
      </div>
    );
  },
);

export default PrintableSheet;
