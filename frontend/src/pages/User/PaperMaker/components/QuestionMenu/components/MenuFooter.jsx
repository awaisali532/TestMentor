import React, { useState } from "react";
import {
  FaCheck,
  FaRobot,
  FaTimes,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import RenderText from "../../../../../../components/ui/RenderText";

const MenuFooter = ({
  count,
  limit,
  sectionLabel,
  onAdd,
  onAutoSelect,
  isChanged,
  selectedQuestions,
  onRemove,
  activeTab,
}) => {
  const [showList, setShowList] = useState(false);
  const relevantSelected = selectedQuestions.filter(
    (q) => q.type === activeTab,
  );

  return (
    <div className="relative w-full bg-white z-1000">
      {/* Selected Items Drawer */}
      {showList && (
        <div className="absolute bottom-17.5 left-0 w-full max-h-87.5 bg-card border-t-[3px] border-accent-1 border-x shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.2)] flex flex-col rounded-t-2xl z-1001 origin-bottom animate-fade-in-up">
          <div className="px-5 py-3 bg-blue-500/5 border-b border-border font-bold text-blue-800 dark:text-blue-400 flex justify-between items-center rounded-t-2xl">
            <span>Selected Questions ({relevantSelected.length})</span>
            <button
              onClick={() => setShowList(false)}
              className="bg-card border border-blue-200 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500"
            >
              <FaTimes />
            </button>
          </div>
          <div className="p-2.5 overflow-y-auto max-h-70 bg-card custom-scrollbar">
            {relevantSelected.length === 0 ? (
              <div className="text-center py-10 text-muted italic flex flex-col gap-2.5">
                No questions selected in this section.
              </div>
            ) : (
              relevantSelected.map((q, i) => (
                <div
                  key={q._id || i}
                  className="flex justify-between items-center px-3 py-2.5 border-b border-pill-bg text-[0.9rem] bg-card transition-colors rounded-md mb-1 hover:bg-pill-bg last:border-none"
                >
                  <div className="flex items-center gap-2.5 text-main flex-1 overflow-hidden">
                    <span className="font-extrabold text-accent-1 min-w-6.25 bg-accent-1/10 px-1.5 py-0.5 rounded text-[0.8rem] text-center">
                      {i + 1}.
                    </span>
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%]">
                      <RenderText
                        text={q.statement?.en || q.statement?.ur || "Question"}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(q)}
                    title="Remove"
                    className="bg-red-500/10 border-none text-red-500 w-7 h-7 rounded-md flex items-center justify-center cursor-pointer text-[0.8rem] ml-2.5 transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Footer Bar */}
      <div className="h-17.5 border-t border-border flex items-center justify-between px-5 bg-card relative z-1002 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-[1.2rem] font-extrabold text-accent-1 leading-none">
              {count}{" "}
              <span className="text-[0.8rem] text-muted font-medium">
                / {limit}
              </span>
            </span>
            <span className="text-[0.7rem] font-semibold text-slate-500 tracking-wide hidden sm:block">
              {sectionLabel}
            </span>
          </div>
          <button
            onClick={() => setShowList(!showList)}
            className={`bg-accent-1/10 border border-accent-1/20 text-accent-1 px-4 py-1.5 rounded-full text-[0.85rem] font-bold cursor-pointer flex items-center transition-all hover:bg-accent-1 hover:text-white hover:border-accent-1 ${showList ? "bg-accent-1 text-white border-accent-1" : ""}`}
          >
            {showList ? <FaChevronDown /> : <FaChevronUp />}
            <span className="ml-1.5 hidden sm:inline">View Selected</span>
            <span className="bg-amber-400 text-black text-[0.7rem] px-1.5 py-0.5 rounded-full ml-2 font-extrabold min-w-5 text-center">
              {relevantSelected.length}
            </span>
          </button>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onAutoSelect}
            title="Auto Fill"
            className="bg-pill-bg text-main border border-border px-4 py-2.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 transition-colors hover:bg-border"
          >
            <FaRobot /> <span className="hidden sm:inline">Auto</span>
          </button>
          <button
            onClick={onAdd}
            disabled={count === 0 && !isChanged}
            className={`bg-linear-to-br from-accent-1 to-blue-700 text-white border-none px-6 py-2.5 rounded-lg font-bold text-[0.95rem] cursor-pointer flex items-center gap-2 shadow-[0_4px_6px_-1px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_15px_-3px_rgba(37,99,235,0.3)] disabled:bg-pill-bg disabled:from-pill-bg disabled:to-pill-bg disabled:text-muted disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${isChanged ? "animate-pulse" : ""}`}
          >
            <FaCheck />{" "}
            <span className="hidden sm:inline">
              {isChanged ? "Update Paper" : "Add to Paper"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MenuFooter);
