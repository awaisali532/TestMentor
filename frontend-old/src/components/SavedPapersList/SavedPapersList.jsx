import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaEye, FaPrint, FaEdit, FaTrash } from "react-icons/fa";
import "./SavedPapersList.css";

// ✅ Import Custom Confirmation Modal
import ConfirmationModal from "../../components/common/ConfirmationModal/ConfirmationModal";

const SavedPapersList = ({ papers, onView, onEdit, onDelete, onPrint }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);

  // Toggle Logic
  const toggleMenu = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 5,
        left: rect.left - 140,
      });
      setOpenMenuId(id);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", handleClickOutside, true);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleClickOutside, true);
    };
  }, []);

  // Delete Handlers
  const handleDeleteClick = (paperId) => {
    setPaperToDelete(paperId);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = () => {
    if (paperToDelete) {
      onDelete(paperToDelete);
    }
    setIsDeleteModalOpen(false);
    setPaperToDelete(null);
  };

  return (
    <div className="sp-table-container">
      <table className="sp-table">
        <thead>
          <tr>
            {/* 1) SR NO */}
            <th style={{ width: "50px" }}>Sr #</th>

            {/* 2) PAPER NAME */}
            <th>Paper Name</th>

            {/* 3) EXAM NAME */}
            <th>Exam Name</th>

            {/* 4) CLASS */}
            <th>Class</th>

            {/* 5) SUBJECT */}
            <th>Subject</th>

            {/* 6) EXAM DATE */}
            <th>Exam Date</th>

            {/* 7) CREATED DATE */}
            <th>Created On</th>

            {/* 8) CREATED BY USER */}
            <th>Created By</th>

            {/* 9) ACTION */}
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper, index) => (
            <tr key={paper._id}>
              {/* 1. Sr No */}
              <td className="fw-bold">{index + 1}</td>

              {/* 2. Paper Name */}
              <td className="fw-bold text-main" title={paper.title}>
                {paper.title?.length > 20
                  ? paper.title.substring(0, 20) + "..."
                  : paper.title}
              </td>

              {/* 3. Exam Name */}
              <td>
                {paper.examLabel ? (
                  <span className="badge-gray">{paper.examLabel}</span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>

              {/* 4. Class */}
              <td>{paper.grade}</td>

              {/* 5. Subject */}
              <td>
                <span className="sp-pill blue">{paper.subject}</span>
              </td>

              {/* ✅ 6. EXAM DATE (FIXED) */}
              <td className="text-muted">
                {paper.examDate
                  ? new Date(paper.examDate).toLocaleDateString()
                  : "-"}
              </td>

              {/* 7. Created Date */}
              <td className="text-muted small">
                {new Date(paper.createdAt).toLocaleDateString()}
              </td>

              {/* 8. Created By */}
              <td className="small">{paper.user?.name || "You"}</td>

              {/* 9. Action Buttons */}
              <td className="text-right">
                <button
                  className="sp-action-toggle"
                  onClick={(e) => toggleMenu(e, paper._id)}
                >
                  <FaEllipsisV />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- DROPDOWN MENU --- */}
      {openMenuId && (
        <div
          className="sp-dropdown-menu fixed-menu"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const activePaper = papers.find((p) => p._id === openMenuId);
            return (
              <>
                <button
                  onClick={() => {
                    onView(activePaper._id);
                    setOpenMenuId(null);
                  }}
                >
                  <FaEye className="icon" /> View
                </button>
                <button
                  onClick={() => {
                    onPrint(activePaper);
                    setOpenMenuId(null);
                  }}
                >
                  <FaPrint className="icon" /> Print
                </button>
                <button
                  onClick={() => {
                    onEdit(activePaper);
                    setOpenMenuId(null);
                  }}
                >
                  <FaEdit className="icon" /> Edit / Reuse
                </button>
                <button
                  onClick={() => handleDeleteClick(activePaper._id)}
                  className="danger"
                >
                  <FaTrash className="icon" /> Delete
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Paper?"
        message="Are you sure you want to delete this paper? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default SavedPapersList;
