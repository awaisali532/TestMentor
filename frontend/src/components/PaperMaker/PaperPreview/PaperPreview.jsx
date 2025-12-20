import React from "react";
import { FaPlusCircle, FaRegFileAlt } from "react-icons/fa";
import "./PaperPreview.css";

const PaperPreview = ({ paperData, questions = [] }) => {
  return (
    <div className="preview-container">
      {/* Agar questions empty hain to Placeholder dikhao */}
      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FaRegFileAlt />
          </div>
          <h3>Start Building Your Paper</h3>
          <p>
            Click on <strong>"Question's Menu"</strong> in the sidebar to browse
            and add questions.
          </p>
          <button className="btn-start-add">
            <FaPlusCircle /> Open Question Menu
          </button>
        </div>
      ) : (
        <div className="questions-list">
          {/* Yahan hum bad mein selected questions show karenge */}
          <p>Selected Questions will appear here list wise...</p>
        </div>
      )}
    </div>
  );
};

export default PaperPreview;
