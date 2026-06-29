import React from "react";
import { FaTrashAlt, FaLayerGroup, FaLock, FaPlus } from "react-icons/fa";
import Select from "react-select";

const TYPE_LABELS = {
  MCQ: "Multiple Choice Questions",
  SHORT: "Short Questions",
  LONG: "Long Questions",
  THEORY: "Theory Section",
  COMPULSORY: "Compulsory Section",
};

const SectionBuilder = ({
  formData,
  handleSectionChange,
  confirmRemoveSection,
  currentCategories,
  chaptersList,
  selectOptions,
  customFilterOption,
  customStyles,
  handleChapterSelect,
  handlePartChange,
  addSubQuestion,
  addSection,
}) => {
  return (
    <div>
      <h4 className="text-xl font-extrabold text-main mb-4 mt-8 px-2">
        Structure Definition
      </h4>

      {formData.sections.map((sec, idx) => (
        <div
          key={idx}
          className="bg-bg-body border border-border rounded-2xl p-5 mb-4 shadow-sm relative group transition-all hover:border-accent-1/30"
        >
          {/* Section Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-3 flex-1">
              <input
                value={sec.questionNo}
                onChange={(e) =>
                  handleSectionChange(idx, "questionNo", e.target.value)
                }
                className="w-16 bg-transparent font-bold text-main border-b border-dashed border-border focus:border-accent-1 outline-none text-lg text-center"
              />
              <input
                value={sec.sectionTitle}
                onChange={(e) =>
                  handleSectionChange(idx, "sectionTitle", e.target.value)
                }
                placeholder="Section Title"
                className="flex-1 bg-transparent font-bold text-main border-b border-dashed border-border focus:border-accent-1 outline-none text-lg"
              />
            </div>
            <button
              type="button"
              onClick={() => confirmRemoveSection(idx)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Remove Section"
            >
              <FaTrashAlt />
            </button>
          </div>

          {/* Section Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted mb-1 uppercase">
                Question Type
              </label>
              <select
                value={sec.questionType}
                onChange={(e) =>
                  handleSectionChange(idx, "questionType", e.target.value)
                }
                className="w-full bg-card border border-border text-main px-3 py-2 rounded-lg focus:outline-none focus:border-accent-1 text-sm"
              >
                <option value="MCQ">MCQ</option>
                <option value="SHORT">Short Answer</option>
                <option value="LONG">Long Question</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-1 uppercase">
                Total Qs
              </label>
              <input
                type="number"
                value={sec.totalQuestions}
                onChange={(e) =>
                  handleSectionChange(idx, "totalQuestions", e.target.value)
                }
                min="1"
                className="w-full bg-card border border-border text-main px-3 py-2 rounded-lg focus:outline-none focus:border-accent-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-1 uppercase">
                Attempt
              </label>
              <input
                type="number"
                value={sec.toAttempt}
                onChange={(e) =>
                  handleSectionChange(idx, "toAttempt", e.target.value)
                }
                min="1"
                readOnly={sec.questionType === "MCQ"}
                className="w-full bg-card border border-border text-main px-3 py-2 rounded-lg focus:outline-none focus:border-accent-1 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-1 uppercase">
                Marks Ea.
              </label>
              <input
                type="number"
                value={sec.hasParts ? 0 : sec.marksPerQuestion}
                onChange={(e) =>
                  handleSectionChange(idx, "marksPerQuestion", e.target.value)
                }
                readOnly={sec.hasParts}
                className="w-full bg-card border border-border text-main px-3 py-2 rounded-lg focus:outline-none focus:border-accent-1 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-muted mb-1 uppercase">
              Default Category
            </label>
            <select
              value={sec.questionCategory}
              onChange={(e) =>
                handleSectionChange(idx, "questionCategory", e.target.value)
              }
              disabled={sec.hasParts}
              className="w-full bg-card border border-border text-main px-3 py-2 rounded-lg focus:outline-none focus:border-accent-1 text-sm disabled:opacity-50"
            >
              {currentCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pairing Logic */}
          {formData.isPairingSpecific && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-accent-1 mb-1 uppercase">
                <FaLayerGroup className="inline mr-1" /> Pairing Chapters
              </label>
              <Select
                isMulti
                options={selectOptions}
                value={chaptersList.filter((opt) =>
                  sec.linkedChapters.includes(opt.value),
                )}
                onChange={(selected, actionMeta) =>
                  handleChapterSelect(idx, selected, actionMeta)
                }
                filterOption={customFilterOption}
                classNamePrefix="select"
                placeholder="Select linked chapters..."
                isDisabled={!formData.subject}
                styles={customStyles}
                menuPortalTarget={document.body}
              />
            </div>
          )}

          {/* Long Question Config (Parts & Compulsory) */}
          {sec.questionType === "LONG" && (
            <div className="mt-4 pt-4 border-t border-dashed border-border">
              <div className="flex gap-6 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sec.hasParts}
                    onChange={(e) =>
                      handleSectionChange(idx, "hasParts", e.target.checked)
                    }
                    className="w-4 h-4 accent-accent-1"
                  />
                  <span className="text-sm font-bold text-main">
                    Enable Sub-Parts (a, b)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sec.isCompulsory || false}
                    onChange={(e) =>
                      handleSectionChange(idx, "isCompulsory", e.target.checked)
                    }
                    className="w-4 h-4 accent-red-500"
                  />
                  <span
                    className={`text-sm font-bold ${sec.isCompulsory ? "text-red-500" : "text-main"}`}
                  >
                    Mark Compulsory <FaLock className="inline mb-1" size={10} />
                  </span>
                </label>
              </div>

              {sec.hasParts && (
                <div className="bg-pill-bg border-l-4 border-accent-1 p-3 rounded-r-lg space-y-2">
                  {sec.subQuestions.map((part, pIdx) => (
                    <div key={pIdx} className="flex gap-2 items-center">
                      <input
                        value={part.label}
                        onChange={(e) =>
                          handlePartChange(idx, pIdx, "label", e.target.value)
                        }
                        placeholder="(a)"
                        className="w-12 bg-card border border-border text-main px-2 py-1.5 rounded-md text-sm text-center"
                      />
                      <select
                        value={part.questionCategory}
                        onChange={(e) =>
                          handlePartChange(
                            idx,
                            pIdx,
                            "questionCategory",
                            e.target.value,
                          )
                        }
                        className="flex-1 bg-card border border-border text-main px-2 py-1.5 rounded-md text-sm"
                      >
                        {currentCategories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={part.marks}
                        onChange={(e) =>
                          handlePartChange(idx, pIdx, "marks", e.target.value)
                        }
                        placeholder="Marks"
                        className="w-16 bg-card border border-border text-main px-2 py-1.5 rounded-md text-sm text-center"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSubQuestion(idx)}
                    className="text-sm font-bold text-accent-1 hover:underline mt-2 flex items-center gap-1"
                  >
                    <FaPlus size={10} /> Add Part
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full py-4 border-2 border-dashed border-border rounded-xl text-muted font-bold hover:text-accent-1 hover:border-accent-1 hover:bg-accent-1/5 transition-all flex items-center justify-center gap-2"
      >
        <FaPlus /> Add New Question Block
      </button>
    </div>
  );
};

export default SectionBuilder;
