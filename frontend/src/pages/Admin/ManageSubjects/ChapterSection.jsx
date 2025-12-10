import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { FaFolderOpen, FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

const ChapterSection = ({
  isExpanded,
  selectedSubject,
  onHeaderClick,
  setIsEditing,
}) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [chapters, setChapters] = useState([]);
  const [newChapter, setNewChapter] = useState({
    number: "",
    name: "",
    desc: "",
  });

  useEffect(() => {
    if (isExpanded && selectedSubject) fetchChapters();
  }, [isExpanded, selectedSubject]);

  const fetchChapters = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/chapters/subject/${selectedSubject._id}`
      );
      setChapters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInput = (e) => {
    setNewChapter({ ...newChapter, [e.target.name]: e.target.value });
    setIsEditing(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/chapters/add`, {
        subjectId: selectedSubject._id,
        chapterNumber: newChapter.number,
        name: newChapter.name,
        description: newChapter.desc,
      });
      toast.success("Chapter Added");
      setNewChapter({ number: "", name: "", desc: "" });
      setIsEditing(false);
      fetchChapters();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || "Failed";

      if (errorMsg.includes("duplicate") || errorMsg.includes("E11000")) {
        // Try to guess which field caused it
        if (errorMsg.includes("chapterNumber")) {
          toast.error(`Chapter Number ${newChapter.number} already exists!`);
        } else if (errorMsg.includes("name")) {
          toast.error(`Chapter Name "${newChapter.name}" already exists!`);
        } else {
          toast.error("Duplicate Chapter Number or Name!");
        }
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete Chapter?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (res.isConfirmed) {
      await axios.delete(`${BASE_URL}/api/chapters/${id}`);
      toast.success("Deleted");
      fetchChapters();
    }
  };

  if (!isExpanded) return null;

  return (
    <div className="section-card expanded border-top-4 border-success">
      <div className="section-title">
        <FaFolderOpen className="text-success me-2" />
        Chapters for{" "}
        <span className="text-success">{selectedSubject?.subjectName}</span>
      </div>

      <div className="row">
        {/* LIST */}
        <div className="col-md-7">
          <div className="list-group shadow-sm">
            {chapters.length === 0 && (
              <div className="p-4 text-center text-muted">
                No Chapters Found
              </div>
            )}
            {chapters.map((ch) => (
              <div
                key={ch._id}
                className="list-group-item d-flex justify-content-between align-items-center py-3"
              >
                <div>
                  <span className="fw-bold me-2 badge bg-primary">
                    Ch {ch.chapterNumber}
                  </span>
                  <span className="fw-bold text-dark">{ch.name}</span>
                </div>
                <button
                  className="btn btn-sm text-danger bg-light"
                  onClick={() => handleDelete(ch._id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ADD FORM */}
        <div className="col-md-5">
          <div className="bg-white p-4 rounded shadow-sm border">
            <h6 className="fw-bold mb-3 text-secondary">Add New Chapter</h6>
            <form onSubmit={handleAdd}>
              <div className="d-flex gap-2 mb-2">
                <input
                  className="form-control"
                  name="number"
                  placeholder="No."
                  style={{ width: "80px" }}
                  value={newChapter.number}
                  onChange={handleInput}
                  required
                />
                <input
                  className="form-control"
                  name="name"
                  placeholder="Chapter Name"
                  value={newChapter.name}
                  onChange={handleInput}
                  required
                />
              </div>
              <input
                className="form-control mb-3"
                name="desc"
                placeholder="Description (Optional)"
                value={newChapter.desc}
                onChange={handleInput}
              />
              <button className="btn btn-success w-100 fw-bold">
                Save Chapter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterSection;
