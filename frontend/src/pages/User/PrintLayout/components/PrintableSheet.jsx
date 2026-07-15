import React, { forwardRef } from "react";
import ExamHeader from "./ExamHeader";
import AnswerKey from "./AnswerKey";
import PaperPreview from "../../PaperMaker/components/PaperPreview/PaperPreview";

const PrintableSheet = forwardRef(
  ({ paperData, settings, instituteInfo, isDual }, ref) => {
    // A4 Size Configurations for Web View
    // Single mode (Portrait): 210mm width
    // Dual mode (Landscape): 297mm width
    const sheetWidthClass = isDual ? "w-[297mm]" : "w-[210mm]";

    const ThePaperContent = () => (
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Watermarks */}
        {settings.watermark === "logo" && instituteInfo.logo && (
          <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
            <img
              src={instituteInfo.logo}
              alt="Watermark"
              className="w-[60%] object-contain grayscale"
            />
          </div>
        )}
        {settings.watermark === "confidential" && (
          <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0 overflow-hidden">
            <h1 className="text-[4rem] font-bold uppercase -rotate-45 text-center leading-none">
              {instituteInfo.name}
            </h1>
          </div>
        )}

        {/* Actual Content (Z-index high to stay above watermark) */}
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

        {/* Answer Key (Printed on a new page if CSS forces it) */}
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
        // Tailwind classes defining the Paper boundaries and print resets
        className={`bg-white text-black shadow-2xl mx-auto min-h-[297mm] h-max relative overflow-visible box-border print:m-0 print:p-0 print:w-full print:shadow-none print:bg-transparent ${sheetWidthClass}`}
        style={{
          // Inline CSS variables passed down to children for dynamic styling
          "--pl-line-h": settings.lineHeight,
          "--pl-font-ur": `${settings.urduFontSize}px`,
          "--pl-font-en": `${settings.engFontSize}px`,
          "--pl-eq-size": `${settings.eqFontSize}px`,
          color: settings.fontColor,
          fontWeight: settings.fontWeight,
        }}
      >
        {isDual ? (
          <div className="flex w-full h-full">
            {/* Copy 1 */}
            <div className="w-[48%] p-[10mm] border-r border-dashed border-slate-400 print:border-black flex flex-col relative">
              <ThePaperContent />
            </div>
            {/* Separator icon (Scissors) hidden in actual print */}
            <div className="w-[4%] flex justify-center relative print:hidden">
              <span className="absolute top-12.5 bg-white px-1 text-slate-500 text-xl z-20">
                ✂
              </span>
            </div>
            {/* Copy 2 */}
            <div className="w-[48%] p-[10mm] flex flex-col relative">
              <ThePaperContent />
            </div>
          </div>
        ) : (
          /* Single Copy */
          <div className="w-full h-full p-[12mm] flex flex-col relative">
            <ThePaperContent />
          </div>
        )}
      </div>
    );
  },
);

export default PrintableSheet;
