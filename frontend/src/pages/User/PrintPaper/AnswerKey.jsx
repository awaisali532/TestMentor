import React from "react";

const AnswerKey = ({ paperData }) => {
  const mcqs = paperData.questions?.filter((q) => q.type === "MCQ") || [];

  if (mcqs.length === 0) return null;

  return (
    <div style={{ marginTop: "20px", fontFamily: "Arial, sans-serif" }}>
      <h3
        style={{
          textAlign: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "10px",
        }}
      >
        Answer Key - {paperData.title}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {mcqs.map((q, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "5px",
              textAlign: "center",
              borderRadius: "4px",
            }}
          >
            <strong>Q.{i + 1}:</strong> {q.correctOption || "-"}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerKey;
