import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlay, FaLock } from "react-icons/fa";

const ChapterAccordion = ({ hierarchy, user, onStartTest }) => {
  // Pehla chapter by default open rakhne ki logic
  const initialOpenState =
    hierarchy.length > 0 ? { [hierarchy[0]._id]: true } : {};
  const [openChapters, setOpenChapters] = useState(initialOpenState);

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  if (hierarchy.length === 0) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-border rounded-2xl bg-card/50 text-muted">
        No chapters added yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {hierarchy.map((chapter) => {
        const isOpen = openChapters[chapter._id];

        return (
          <div
            key={chapter._id}
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "border-accent-1 shadow-lg shadow-accent-1/10 bg-card" : "border-border bg-card/50"}`}
          >
            {/* Header */}
            <div
              onClick={() => toggleChapter(chapter._id)}
              className="p-5 flex justify-between items-center cursor-pointer hover:bg-bg-body transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-accent-1 tracking-widest uppercase mb-1 block">
                  Chapter {chapter.chapterNumber}
                </span>
                <h4 className="text-lg font-bold text-main m-0">
                  {typeof chapter.name === "object"
                    ? chapter.name.en
                    : chapter.name}
                </h4>
              </div>
              <div className="text-muted">
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {/* Body (Topics) */}
            {isOpen && (
              <div className="bg-bg-body/50 border-t border-border">
                {chapter.topics.length > 0 ? (
                  chapter.topics.map((topic, index) => (
                    <div
                      key={topic._id}
                      className={`p-4 flex justify-between items-center transition-colors hover:bg-card ${index !== chapter.topics.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="size-8 rounded-full bg-pill-bg border border-border flex items-center justify-center text-xs font-bold text-muted">
                          {topic.topicNumber}
                        </span>
                        <span
                          className={`font-medium ${user ? "text-main" : "text-muted"}`}
                        >
                          {typeof topic.name === "object"
                            ? topic.name.en
                            : topic.name}
                        </span>
                      </div>

                      <button
                        onClick={() => onStartTest(topic._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer ${
                          user
                            ? "bg-linear-to-r from-accent-1 to-accent-2 text-white shadow-md shadow-accent-1/30 hover:scale-105"
                            : "bg-pill-bg border border-border text-muted hover:bg-red-500 hover:text-white hover:border-red-500"
                        }`}
                      >
                        {user ? (
                          <>
                            <FaPlay size={10} /> Start
                          </>
                        ) : (
                          <>
                            <FaLock size={12} /> Locked
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-center text-sm italic text-muted">
                    No topics available in this chapter.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChapterAccordion;
