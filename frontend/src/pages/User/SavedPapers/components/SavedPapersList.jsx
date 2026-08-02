import React, { useState, useEffect, useRef } from "react";
import {
  FaEye,
  FaPrint,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaFileAlt,
  FaCopy,
} from "react-icons/fa";

const SavedPapersList = ({ papers, onView, onEdit, onDelete, onPrint }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm animate-fade-in">
      <table className="w-full text-left border-collapse min-w-250">
        <thead>
          <tr className="bg-pill-bg text-muted text-xs uppercase tracking-wider border-b border-border">
            <th className="p-4 font-bold w-12 text-center">Sr #</th>
            <th className="p-4 font-bold">Paper Name</th>
            <th className="p-4 font-bold">Exam Name</th>
            <th className="p-4 font-bold">Class</th>
            <th className="p-4 font-bold">Subject</th>
            <th className="p-4 font-bold">Exam Date</th>
            <th className="p-4 font-bold">Created On</th>
            <th className="p-4 font-bold">Created By</th>
            <th className="p-4 font-bold text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {papers.map((paper, index) => (
            <tr
              key={paper._id}
              className="hover:bg-pill-bg/50 transition-colors group"
            >
              {/* 1. Sr No */}
              <td className="p-4 font-bold text-main text-center">
                {index + 1}
              </td>

              {/* 2. Paper Name */}
              <td
                className="p-4 font-extrabold text-main max-w-50 truncate"
                title={paper.title}
              >
                {paper.title}
              </td>

              {/* 3. Exam Name */}
              <td className="p-4">
                {paper.examLabel ? (
                  <span className="bg-bg-body border border-border text-muted px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap">
                    {paper.examLabel}
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>

              {/* 4. Class */}
              <td className="p-4 text-main font-medium">{paper.grade}</td>

              {/* 5. Subject */}
              <td className="p-4">
                <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap dark:bg-blue-500/20 dark:text-blue-400">
                  {typeof paper.subject === "object"
                    ? paper.subject?.subjectName || "Subject"
                    : paper.subject}
                </span>
              </td>

              {/* 6. Exam Date */}
              <td className="p-4 text-muted text-sm font-medium">
                {paper.examDate
                  ? new Date(paper.examDate).toLocaleDateString()
                  : "-"}
              </td>

              {/* 7. Created Date */}
              <td className="p-4 text-muted text-xs font-medium">
                {new Date(paper.createdAt).toLocaleDateString()}
              </td>

              {/* 8. Created By */}
              <td className="p-4 text-main text-sm font-medium">
                {paper.user?.name || "You"}
              </td>

              {/* 9. Inline Action Buttons */}
              <td className="p-4 text-right pr-6">
                <div className="flex items-center justify-end gap-2 relative">
                  {/* VIEW BUTTON */}
                  <button
                    onClick={() => onView(paper._id)}
                    className="p-2 bg-bg-body text-muted hover:text-accent-1 hover:bg-accent-1/10 border border-border hover:border-accent-1/30 rounded-lg transition-all"
                    title="View Paper"
                  >
                    <FaEye size={14} />
                  </button>

                  {/* PRINT DROPDOWN BUTTON */}
                  <div
                    className="relative"
                    ref={openDropdownId === paper._id ? menuRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === paper._id ? null : paper._id,
                        )
                      }
                      className="p-2 bg-bg-body text-muted hover:text-green-500 hover:bg-green-500/10 border border-border hover:border-green-500/30 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Print Options"
                    >
                      <FaPrint size={14} />
                      <FaChevronDown size={9} className="opacity-70" />
                    </button>

                    {openDropdownId === paper._id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in p-1 text-left">
                        <button
                          onClick={() => {
                            setOpenDropdownId(null);
                            onPrint(paper, "SINGLE");
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-main hover:bg-pill-bg rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaFileAlt className="text-green-500 text-sm shrink-0" />
                          <span>Single Print (1-Sided)</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenDropdownId(null);
                            onPrint(paper, "DUAL_H");
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-main hover:bg-pill-bg rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaCopy className="text-blue-500 text-sm shrink-0" />
                          <span>Double Print (2-Sided)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => onEdit(paper)}
                    className="p-2 bg-bg-body text-muted hover:text-yellow-500 hover:bg-yellow-500/10 border border-border hover:border-yellow-500/30 rounded-lg transition-all"
                    title="Edit / Reuse"
                  >
                    <FaEdit size={14} />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => onDelete(paper._id)}
                    className="p-2 bg-bg-body text-muted hover:text-red-500 hover:bg-red-500/10 border border-border hover:border-red-500/30 rounded-lg transition-all"
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SavedPapersList;
