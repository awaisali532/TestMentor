import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaEye, FaPrint, FaEdit, FaTrash } from "react-icons/fa";
import "./SavedPapersList.css";

const SavedPapersList = ({ papers, onView, onEdit, onDelete, onPrint }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Toggle Logic with Position Calculation
  const toggleMenu = (e, id) => {
    e.stopPropagation(); // Stop click from closing immediately

    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      // Calculate button position on screen
      const rect = e.currentTarget.getBoundingClientRect();
      // Set dropdown position (Thoda left aur niche)
      setMenuPos({
        top: rect.bottom + 5,
        left: rect.left - 140, // 140px left shift taake menu andar rahe
      });
      setOpenMenuId(id);
    }
  };

  // Close menu when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", handleClickOutside, true); // Scroll par bhi band ho jaye
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleClickOutside, true);
    };
  }, []);

  return (
    <div className="sp-table-container">
      <table className="sp-table">
        <thead>
          <tr>
            <th>Paper Title</th>
            <th>Subject</th>
            <th>Grade/Level</th>
            <th>Created At</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper._id}>
              {/* Title Column - Fixed Color Logic */}
              <td className="fw-bold text-main">{paper.title}</td>

              {/* Subject Column */}
              <td>
                <span className="sp-pill blue">{paper.subject}</span>
              </td>

              {/* Grade Column */}
              <td>{paper.grade}</td>

              {/* Date Column */}
              <td className="text-muted">
                {new Date(paper.createdAt).toLocaleDateString()}
              </td>

              {/* Action Column */}
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

      {/* ✅ DROPDOWN MENU (Rendered Outside Table Rows) 
         Ye ab 'fixed' position use karega, isliye table isay nahi katega.
      */}
      {openMenuId && (
        <div
          className="sp-dropdown-menu fixed-menu"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()} // Menu click par band na ho
        >
          {/* Find active paper to pass to functions */}
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
                  onClick={() => {
                    onDelete(activePaper._id);
                    setOpenMenuId(null);
                  }}
                  className="danger"
                >
                  <FaTrash className="icon" /> Delete
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SavedPapersList;
