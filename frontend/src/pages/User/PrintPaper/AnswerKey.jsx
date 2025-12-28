import React from "react";

const AnswerKey = ({ paperData }) => {
  // 1. Sirf MCQs filter karo
  const mcqs = paperData.questions?.filter((q) => q.type === "MCQ") || [];

  if (mcqs.length === 0) return null;

  // 2. Logic: Correct Option (A, B, C, D) nikalne ke liye
  const getCorrectOptionLabel = (question) => {
    if (!question.options) return "-";

    // Find index jahan isCorrect true ho
    const correctIndex = question.options.findIndex((opt) => opt.isCorrect);

    if (correctIndex === -1) return "-"; // Agar koi correct mark nahi hua

    // Convert Index to Letter (0 -> A, 1 -> B, 2 -> C, 3 -> D)
    return String.fromCharCode(65 + correctIndex);
  };

  return (
    <div style={{ marginTop: "15px", fontFamily: "Arial, sans-serif" }}>
      {/* Title */}
      <h3
        style={{
          textAlign: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "10px",

          textTransform: "uppercase",
          fontSize: "0.9rem",
        }}
      >
        Answer Key (MCQs)
      </h3>

      {/* Grid Layout for Answers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", // Responsive Columns
          gap: "10px",
        }}
      >
        {mcqs.map((q, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: "1px solid #ccc",
              padding: "5px",
              borderRadius: "4px",
              backgroundColor: "#2f2d2dff",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            <strong style={{ color: "#fff" }}>{i + 1}.</strong>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {getCorrectOptionLabel(q)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerKey;
