import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useUser } from "../../../context/UserContext";
import PrintSettingsBar from "./PrintSettingsBar/PrintSettingsBar";
import ExamHeader from "./ExamHeader/ExamHeader";
import AnswerKey from "./AnswerKey";
import PaperPreview from "../../../components/PaperMaker/PaperPreview/PaperPreview";
import "./PrintLayout.css";

const PrintLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { user } = useUser();

  const paperData = location.state;
  const printMode = paperData?.printSettings?.mode || "SINGLE";

  // ✅ SMART DEFAULTS LOGIC
  // Agar Dual Mode hai to Font chota rakho, warna Normal
  const isDual = printMode === "DUAL_H";

  const [settings, setSettings] = useState({
    // --- Dynamic Sizes based on Mode ---
    lineHeight: isDual ? 0.7 : 1, // Dual me lines qareeb
    urduFontSize: isDual ? 9 : 11, // Dual me Urdu choti
    engFontSize: isDual ? 9 : 12, // Dual me English choti
    eqFontSize: isDual ? 10 : 12, // Equations choti
    headerSize: isDual ? 0.8 : 1, // Header Scaling (Optional)

    // --- Common Settings ---
    fontColor: "#000000",
    fontWeight: "400",
    showBubbleSheet: true,
    showSyllabus: true,
    showAnswerKey: false,
    watermark: "logo",
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: paperData?.title || "Exam_Paper",
  });

  if (!paperData)
    return <div className="p-5 text-center">No Paper Data. Go back.</div>;

  const instituteInfo = {
    name: user?.institute?.name || "",
    address: user?.institute?.address || "",
    phone: user?.institute?.phone || "",
    logo: user?.institute?.logo || null,
  };

  // ✅ PAGE ORIENTATION LOGIC
  const pageStyle = `
    @page {
      size: ${printMode === "DUAL_H" ? "landscape" : "portrait"};
      margin: 0;
    }
  `;

  // Content Component
  const PaperContent = () => (
    <div className="pl-paper-content-wrapper">
      {settings.watermark === "logo" && instituteInfo.logo && (
        <div className="pl-watermark-overlay">
          <img src={instituteInfo.logo} alt="Watermark" />
        </div>
      )}
      {settings.watermark === "confidential" && (
        <div className="pl-watermark-overlay text-only">
          <h1>{instituteInfo.name || "INSTITUTE NAME"}</h1>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2 }}>
        <ExamHeader
          paperData={paperData}
          settings={settings}
          institute={instituteInfo}
        />
        <div className="pl-content">
          <PaperPreview paperData={paperData} isPrintMode={true} />
        </div>
      </div>

      {settings.showAnswerKey && (
        <div className="pl-page-break">
          <AnswerKey paperData={paperData} />
        </div>
      )}
    </div>
  );

  return (
    <div className="pl-container">
      {/* ✅ INJECT STYLE */}
      <style>{pageStyle}</style>

      <PrintSettingsBar
        settings={settings}
        setSettings={setSettings}
        onPrint={handlePrint}
        onBack={() => navigate(-1)}
      />

      {/* Main Print Viewport */}
      <div
        className={`pl-print-viewport mode-${printMode.toLowerCase()}`}
        ref={componentRef}
        style={{
          "--pl-line-h": settings.lineHeight,
          "--pl-font-ur": `${settings.urduFontSize}px`,
          "--pl-font-en": `${settings.engFontSize}px`,
          "--pl-eq-size": `${settings.eqFontSize}px`,
          "--pl-color": settings.fontColor,
          "--pl-weight": settings.fontWeight,
        }}
      >
        {/* Copy 1 */}
        <div className="pl-sheet-copy copy-1">
          <PaperContent />
        </div>

        {/* Copy 2 (Only For Dual Horizontal) */}
        {printMode === "DUAL_H" && (
          <>
            <div className="pl-print-separator">
              <span className="cut-icon">✂</span>
            </div>
            <div className="pl-sheet-copy copy-2">
              <PaperContent />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrintLayout;
