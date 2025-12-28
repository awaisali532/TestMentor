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

  // --- SETTINGS STATE ---
  const [settings, setSettings] = useState({
    lineHeight: 1,
    urduFontSize: 13,
    engFontSize: 12,
    eqFontSize: 12,
    headerSize: 1,
    fontColor: "#000000",
    fontWeight: "400",
    showBubbleSheet: true,
    showSyllabus: true,
    showAnswerKey: false,
    watermark: "logo", // ✅ DEFAULT LOGO
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: paperData?.title || "Exam_Paper",
  });

  if (!paperData)
    return <div className="p-5 text-center">No Paper Data Found. Go back.</div>;

  const instituteInfo = {
    name: user?.institute?.name || "",
    address: user?.institute?.address || "",
    phone: user?.institute?.phone || "",
    logo: user?.institute?.logo || null,
  };

  return (
    <div className="pl-container">
      <PrintSettingsBar
        settings={settings}
        setSettings={setSettings}
        onPrint={handlePrint}
        onBack={() => navigate(-1)}
      />

      <div
        className="pl-paper-sheet"
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
        {/* ✅ WATERMARK RENDERING LOGIC */}
        {settings.watermark === "logo" && instituteInfo.logo && (
          <div className="pl-watermark-overlay">
            <img src={instituteInfo.logo} alt="Watermark" />
          </div>
        )}

        {settings.watermark === "confidential" && (
          <div className="pl-watermark-overlay text-only">
            <h1>{instituteInfo.name || "INSTITUTE NAME"}</h1>{" "}
          </div>
        )}

        {/* Main Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <ExamHeader
            paperData={paperData}
            settings={settings}
            institute={instituteInfo}
          />
          <div className="pl-content">
            <PaperPreview
              paperData={paperData}
              onOpenMenu={() => {}}
              isPrintMode={true}
            />
          </div>
        </div>

        {settings.showAnswerKey && (
          <div className="pl-page-break">
            <AnswerKey paperData={paperData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintLayout;
