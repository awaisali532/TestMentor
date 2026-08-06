import React, { forwardRef } from "react";
import ExamHeader from "./ExamHeader";
import AnswerKey from "./AnswerKey";
import PaperPreview from "../../../../pages/User/PaperMaker/components/PaperPreview/PaperPreview";

const PrintableSheet = forwardRef(
  ({ paperData, settings, instituteInfo, isDual }, ref) => {
    const getPaperMinHeight = () => {
      if (isDual) {
        if (settings.paperSize === "legal" || settings.paperSize === "letter")
          return "min-h-[calc(100vh-10rem)] md:min-h-[216mm]";
        return "min-h-[calc(100vh-10rem)] md:min-h-[210mm]";
      } else {
        if (settings.paperSize === "legal")
          return "min-h-[calc(100vh-10rem)] md:min-h-[356mm]";
        if (settings.paperSize === "letter")
          return "min-h-[calc(100vh-10rem)] md:min-h-[279mm]";
        return "min-h-[calc(100vh-10rem)] md:min-h-[297mm]";
      }
    };

    const getPaperWidthClass = () => {
      return "w-full";
    };

    const ThePaperContent = () => (
      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="relative z-10 flex-1">
          <ExamHeader
            paperData={paperData}
            settings={settings}
            institute={instituteInfo}
          />
          <div className="mt-2 print:mt-1">
            <PaperPreview
              paperData={paperData}
              isPrintMode={true}
              separateObjective={settings.separateObjective}
            />
          </div>
        </div>
        {settings.showAnswerKey && (
          <div className="mt-8 break-before-page pt-4 border-t border-dashed border-black">
            <AnswerKey paperData={paperData} />
          </div>
        )}
      </div>
    );

    const Watermark = ({ isCopy2 = false }) => {
      if (settings.watermark === "none") return null;

      const watermarkClass = isDual
        ? isCopy2
          ? "watermark-overlay copy-2-watermark"
          : "watermark-overlay copy-1-watermark"
        : "watermark-overlay single-watermark";

      return (
        <div className={watermarkClass}>
          {settings.watermark === "logo" && instituteInfo.logo ? (
            <img
              src={instituteInfo.logo}
              alt="Watermark"
              className="w-full object-contain grayscale"
            />
          ) : settings.watermark === "confidential" ? (
            <h1 className="text-[3rem] font-bold uppercase -rotate-45 text-center leading-none">
              {instituteInfo.name}
            </h1>
          ) : null}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={`bg-white text-black shadow-2xl mx-auto relative h-auto overflow-visible box-border print:m-0 print:w-full print:shadow-none print:bg-transparent print:block print:min-h-0 ${getPaperWidthClass()} ${getPaperMinHeight()} print-wrapper-scope`}
        style={{
          color: settings.fontColor,
          fontWeight: settings.fontWeight,
        }}
      >
        <style>{`
        .print-wrapper-scope {
          line-height: ${settings.lineHeight};
          font-family: var(--font-sans), sans-serif !important;
        }
        .print-wrapper-scope .pp-text-en,
        .print-wrapper-scope .pp-text-en * {
          font-size: ${settings.engFontSize}px !important;
          font-family: var(--font-sans), sans-serif !important;
        }
        .print-wrapper-scope .pp-text-ur,
        .print-wrapper-scope .pp-text-ur * {
          font-size: ${settings.urduFontSize}px !important;
        }
        .print-wrapper-scope .math-jax-output,
        .print-wrapper-scope .math-jax-output *,
        .print-wrapper-scope .katex,
        .print-wrapper-scope .katex *,
        .print-wrapper-scope .katex-html,
        .print-wrapper-scope .katex-html *,
        .print-wrapper-scope .MathJax,
        .print-wrapper-scope .MathJax * {
          font-size: ${settings.eqFontSize}px !important;
        }
        
        .watermark-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.1;
          pointer-events: none;
          z-index: 0;
          width: 55%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        @media print {
          .watermark-overlay {
            position: fixed !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 0 !important;
            opacity: 0.08 !important;
            width: ${isDual ? "28%" : "55%"} !important;
            display: flex !important;
          }
          ${
            isDual
              ? `
            .copy-1-watermark {
              left: 25% !important;
            }
            .copy-2-watermark {
              left: 75% !important;
            }
          `
              : `
            .single-watermark {
              left: 50% !important;
            }
          `
          }
        }
      `}</style>

        {isDual ? (
          /* ✅ FIX: Added gap and horizontal padding so both sides don't stick together */
          <div className="flex w-full h-auto min-h-full relative justify-between px-2 print:px-1">
            <div
              className="w-[49%] p-3 sm:p-4 print:p-1 flex flex-col relative h-auto min-h-full"
              style={{ zoom: 0.75 }}
            >
              <Watermark isCopy2={false} />
              <ThePaperContent />
            </div>

            <div className="absolute top-0 bottom-0 left-1/2 w-0 border-l border-dashed border-slate-400 print:border-black -translate-x-1/2 pointer-events-none z-20"></div>

            <div className="absolute top-12.5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 text-slate-500 text-sm z-30 border border-slate-200 rounded-full shadow-sm print:hidden">
              ✂
            </div>

            <div
              className="w-[49%] p-3 sm:p-4 print:p-1 flex flex-col relative h-auto min-h-full"
              style={{ zoom: 0.75 }}
            >
              <Watermark isCopy2={true} />
              <ThePaperContent />
            </div>
          </div>
        ) : (
          <div className="w-full h-auto min-h-full p-4 sm:p-6 print:p-0 flex flex-col print:block relative print:min-h-0">
            <Watermark />
            <ThePaperContent />
          </div>
        )}
      </div>
    );
  },
);

export default PrintableSheet;
