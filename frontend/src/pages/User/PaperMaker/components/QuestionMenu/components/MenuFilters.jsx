import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaChevronDown,
  FaCheckSquare,
  FaRegSquare,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import Loader from "../../../../../../components/ui/Loader";
import RenderText from "../../../../../../components/ui/RenderText";

const MenuFilters = ({
  filters,
  setFilters,
  categoriesList,
  difficultiesList,
  loading,
  availablePool = [],
  onSelectQuestion,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const filtersRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target))
        setOpenDropdown(null);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setSearchTerm("");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (e, type, value, allOptions) => {
    e.stopPropagation();
    setFilters((prev) => {
      const currentList = prev[type] || [];
      let newList;
      if (value === "ALL") {
        const allValues = allOptions.map((opt) =>
          typeof opt === "object" ? opt.value : opt,
        );
        const areAllSelected = allValues.every((val) =>
          currentList.includes(val),
        );
        newList = areAllSelected ? [] : [...allValues];
      } else {
        const exists = currentList.includes(value);
        newList = exists
          ? currentList.filter((item) => item !== value)
          : [...currentList, value];
      }
      return { ...prev, [type]: newList };
    });
  };

  // Live Search Matcher (Top 8 Results)
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return availablePool
      .filter(
        (q) =>
          q.statement?.en?.toLowerCase().includes(term) ||
          q.statement?.ur?.includes(term),
      )
      .slice(0, 8);
  }, [searchTerm, availablePool]);

  const renderDropdown = (label, type, options) => {
    const safeOptions = Array.isArray(options) ? options : [];
    const selected = filters[type] || [];
    const isOpen = openDropdown === type;
    const isAllSelected =
      safeOptions.length > 0 &&
      safeOptions.every((opt) =>
        selected.includes(typeof opt === "object" ? opt.value : opt),
      );

    return (
      <div
        className={`flex-1 flex flex-col gap-1.5 relative ${isOpen ? "z-100" : "z-10"}`}
      >
        <label className="text-[0.75rem] font-bold text-muted uppercase tracking-wider">
          {label}
        </label>
        <div
          onClick={() => setOpenDropdown(isOpen ? null : type)}
          className={`px-4 py-3 rounded-xl border bg-bg-body text-main text-[0.9rem] cursor-pointer flex justify-between items-center transition-all select-none ${isOpen ? "border-accent-1 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" : "border-border hover:border-accent-1"}`}
        >
          <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {isAllSelected
              ? `All ${label}s`
              : selected.length > 0
                ? `${selected.length} Selected`
                : "None Selected"}
          </span>
          <FaChevronDown
            className={`text-[0.8rem] opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
            {/* Dropdown items mapping logic exactly same */}
            {safeOptions.map((opt, index) => {
              const value = typeof opt === "object" ? opt.value : opt;
              const displayLabel = typeof opt === "object" ? opt.label : opt;
              const isChecked = selected.includes(value);
              return (
                <div
                  key={index}
                  className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer text-[0.9rem] hover:bg-pill-bg ${isChecked ? "bg-accent-1/5" : ""}`}
                  onClick={(e) => toggleSelection(e, type, value, safeOptions)}
                >
                  {isChecked ? (
                    <FaCheckSquare className="text-accent-1 text-[1.1rem]" />
                  ) : (
                    <FaRegSquare className="text-muted text-[1.1rem]" />
                  )}
                  <span className="truncate">{displayLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {loading && <Loader fullScreen={true} text="Applying Filters..." />}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5"
        ref={filtersRef}
      >
        {renderDropdown("Category", "category", categoriesList)}
        {renderDropdown("Difficulty", "difficulty", difficultiesList)}

        {/* NAYA SEARCH BOX (Autocomplete Style) */}
        <div className="flex flex-col gap-1.5 relative z-50" ref={searchRef}>
          <label className="text-[0.75rem] font-bold text-muted uppercase tracking-wider">
            Search
          </label>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search Question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-bg-body text-main text-[0.9rem] focus:outline-none focus:border-accent-1"
            />
            {searchTerm && (
              <FaTimes
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted cursor-pointer hover:text-red-500"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchTerm && searchResults.length > 0 && (
            <div className="absolute top-[105%] left-0 w-[150%] bg-card border border-accent-1 shadow-2xl rounded-xl overflow-hidden z-9999 max-h-87.5 overflow-y-auto custom-scrollbar">
              {searchResults.map((q, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onSelectQuestion(q);
                    setSearchTerm("");
                  }}
                  className="p-3 border-b border-border cursor-pointer hover:bg-accent-1/10 transition-colors flex items-start gap-2"
                >
                  <span className="text-accent-1 font-bold mt-1">Q.</span>
                  <div className="flex-1">
                    {q.statement?.en && (
                      <div className="text-[0.95rem] line-clamp-2">
                        <RenderText text={q.statement.en} />
                      </div>
                    )}
                    {q.statement?.ur && (
                      <div
                        className="urdu-font text-lg text-right line-clamp-2 mt-1"
                        dir="rtl"
                      >
                        <RenderText text={q.statement.ur} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(MenuFilters);
