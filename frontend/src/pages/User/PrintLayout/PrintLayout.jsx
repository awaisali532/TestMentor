import React, { useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useUser } from "../../../context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2"; // ✅ FIX: SweetAlert2 import for smart warning

import PrintSettingsBar from "./components/PrintSettingsBar";
import PrintableSheet from "./components/PrintableSheet";
import SavePaperModal from "../../../pages/User/PaperMaker/components/SavePaperModal";

const PrintLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { user } = useUser();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [paperData, setPaperData] = useState(() => {
    if (location.state) return location.state;
    const localData = localStorage.getItem("tm_print_data");
    return localData ? JSON.parse(localData) : null;
  });

  const printMode = paperData?.printSettings?.mode || "SINGLE";
  const isDual = printMode === "DUAL_H";

  const [isSaved, setIsSaved] = useState(!!paperData?._id);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [settings, setSettings] = useState({
    lineHeight: isDual ? 1 : 1.2,
    urduFontSize: isDual ? 12 : 11,
    engFontSize: isDual ? 11 : 10,
    eqFontSize: isDual ? 10 : 10,
    headerSize: isDual ? 0.8 : 1,
    fontColor: "#000000",
    fontWeight: "400",
    watermark: "logo",
    showBubbleSheet: true,
    showSyllabus: true,
    showAnswerKey: false,
    paperSize: "a4",
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: paperData?.title || "Exam_Paper",
  });

  // ✅ SMART WARNING LOGIC: Print button interceptor
  const handlePrintClick = () => {
    // 🔥 YAHAN APNI LOGIC LAGAYEIN: Jo condition aapne Save button disable karne ke liye lagayi hai
    // Example: const isPaperComplete = paperData.totalMarks === requiredMarks;
    const isPaperComplete = false; // Isko apni original condition se replace karein

    if (!isPaperComplete) {
      Swal.fire({
        title: "Paper Incomplete!",
        text: "Aap ka paper abhi mukammal nahi hai. Kya aap waqai is adhoore paper ka draft print karna chahte hain?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Print Draft",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          handlePrint(); // User ne warning ke baad bhi allow kar diya
        }
      });
    } else {
      handlePrint(); // Paper complete hai, direct print karo
    }
  };

  const handleSaveClick = () => {
    if (isSaved) return toast.success("Paper is already saved.");
    setShowSaveModal(true);
  };

  const handleConfirmSave = async (titleToSave) => {
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const safeSubject = paperData.subject?._id || paperData.subject;
      const safePattern = paperData.selectedPattern || {};

      const formattedQuestions = paperData.questions.map((q) => ({
        questionId: q._id || q.questionId,
        type: q.type,
        statement: { en: q.statement?.en || "", ur: q.statement?.ur || "" },
        options:
          q.options?.map((opt) => ({
            en: opt.en || "",
            ur: opt.ur || "",
            isCorrect: opt.isCorrect || false,
          })) || [],
        marks: q.marks || 1,
        tabId: q.tabId || "",
      }));

      const payload = {
        title: titleToSave,
        grade: paperData.grade,
        subject: safeSubject,
        questions: formattedQuestions,
        totalMarks: paperData.questions.reduce(
          (sum, q) => sum + (q.marks || 1),
          0,
        ),
        pattern: safePattern,
        examDate: paperData.examDate,
        examLabel: paperData.examLabel,
        syllabusLabel: paperData.syllabusLabel,
      };

      let apiUrl = `${BASE_URL}/api/papers/save`;
      let method = "post";

      if (paperData._id && paperData.title === titleToSave) {
        apiUrl = `${BASE_URL}/api/papers/update/${paperData._id}`;
        method = "put";
      }

      const res = await axios[method](apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(method === "put" ? "Paper Updated!" : "Paper Saved!");
        setIsSaved(true);
        setShowSaveModal(false);
        const updatedState = {
          ...paperData,
          _id: res.data.paperId,
          title: titleToSave,
        };
        setPaperData(updatedState);
        localStorage.setItem("tm_print_data", JSON.stringify(updatedState));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save paper.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (paperData?.isAutoGenerated)
      navigate("/user/generate-paper", { state: { keepData: true } });
    else navigate(-1);
  };

  const handleEdit = () => navigate("/user/paper-maker", { state: paperData });

  if (!paperData)
    return (
      <div className="p-5 text-center text-red-500 font-bold">
        No Paper Data Found. Please go back.
      </div>
    );

  const instituteInfo = {
    name: user?.institute?.name || "Institute Name",
    address: user?.institute?.address || "",
    phone: user?.institute?.phone || "",
    logo: user?.institute?.logo || null,
  };

  const pageStyle = `
    @page { 
      size: auto;
      margin: 5mm;
    }
    @media print {
      html, body, #root {
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        background: white !important;
        display: block !important;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col font-sans overflow-hidden print:block print:h-auto print:min-h-0 print:overflow-visible print:bg-white">
      <Toaster position="top-center" containerStyle={{ zIndex: 100000 }} />
      <style>{pageStyle}</style>
      <SavePaperModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        defaultTitle={
          paperData.title === "Untitled Paper" ? "" : paperData.title
        }
        isSaving={isSaving}
      />
      <PrintSettingsBar
        settings={settings}
        setSettings={setSettings}
        onPrint={
          handlePrintClick
        } /* ✅ FIX: Changed from handlePrint to handlePrintClick */
        onBack={handleBack}
        onEdit={handleEdit}
        onSave={handleSaveClick}
        isSaved={isSaved}
        isSaving={isSaving}
      />
      <div className="flex-1 overflow-y-auto px-4 py-6 mt-32 print:block print:mt-0 print:p-0 print:overflow-visible flex justify-center">
        <PrintableSheet
          ref={componentRef}
          paperData={paperData}
          settings={settings}
          instituteInfo={instituteInfo}
          isDual={isDual}
        />
      </div>
    </div>
  );
};

export default PrintLayout;
