import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaCheckSquare, FaRegSquare } from "react-icons/fa";
import Loader from "../../../../../../components/ui/Loader";
import LiveSearch from "./LiveSearch";

const MenuFilters = ({
  filters,
  setFilters,
  categoriesList,
  difficultiesList,
  loading, // Parent loading
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [localLoading, setLocalLoading] = useState(false); // ✅ Naya Local Loader State
  const filtersRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Wrapped in setTimeout to let React paint the Loader first before heavy calculations
  const toggleSelection = (e, type, value) => {
    e.stopPropagation();
    setLocalLoading(true); // Loader On

    setTimeout(() => {
      setFilters((prev) => {
        const currentList = prev[type] || [];
        const exists = currentList.includes(value);
        const newList = exists
          ? currentList.filter((item) => item !== value)
          : [...currentList, value];
        return { ...prev, [type]: newList };
      });

      // Thora sa delay de kar Loader Off taake rendering mukammal ho jaye
      setTimeout(() => setLocalLoading(false), 350);
    }, 10);
  };

  const toggleSingleSelection = (e, type, value) => {
    e.stopPropagation();
    setOpenDropdown(null);
    setLocalLoading(true); // Loader On

    setTimeout(() => {
      setFilters((prev) => ({ ...prev, [type]: value }));
      setTimeout(() => setLocalLoading(false), 350);
    }, 10);
  };

  const clearSelection = (e, type) => {
    e.stopPropagation();
    setLocalLoading(true); // Loader On

    setTimeout(() => {
      setFilters((prev) => ({ ...prev, [type]: [] }));
      setTimeout(() => setLocalLoading(false), 350);
    }, 10);
  };

  const renderDropdown = (label, type, options) => {
    const safeOptions = Array.isArray(options) ? options : [];
    const selected = filters[type] || [];
    const isOpen = openDropdown === type;
    const isAllSelected =
      selected.length === 0 ||
      (safeOptions.length > 0 &&
        safeOptions.every((opt) =>
          selected.includes(typeof opt === "object" ? opt.value : opt),
        ));

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
            {isAllSelected ? `All ${label}s` : `${selected.length} Selected`}
          </span>
          <FaChevronDown
            className={`text-[0.8rem] opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
            <div
              className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer text-[0.9rem] hover:bg-pill-bg border-b border-border ${isAllSelected ? "bg-accent-1/5 text-accent-1 font-bold" : "text-main"}`}
              onClick={(e) => clearSelection(e, type)} // ✅ Applied Loader here too
            >
              {isAllSelected ? (
                <FaCheckSquare className="text-[1.1rem]" />
              ) : (
                <FaRegSquare className="text-muted text-[1.1rem]" />
              )}
              <span>All {label}s</span>
            </div>
            {safeOptions.map((opt, index) => {
              const value = typeof opt === "object" ? opt.value : opt;
              const displayLabel = typeof opt === "object" ? opt.label : opt;
              const isChecked = !isAllSelected && selected.includes(value);
              return (
                <div
                  key={index}
                  className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer text-[0.9rem] hover:bg-pill-bg ${isChecked ? "bg-accent-1/5 text-accent-1 font-medium" : "text-main"}`}
                  onClick={(e) => toggleSelection(e, type, value)}
                >
                  {isChecked ? (
                    <FaCheckSquare className="text-[1.1rem]" />
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

  const renderSingleDropdown = (label, type, options) => {
    const selected = filters[type] || "BOTH";
    const isOpen = openDropdown === type;
    const selectedLabel =
      options.find((o) => o.value === selected)?.label || "Both (Dual Medium)";

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
            {selectedLabel}
          </span>
          <FaChevronDown
            className={`text-[0.8rem] opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {options.map((opt, index) => {
              const isChecked = selected === opt.value;
              return (
                <div
                  key={index}
                  className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer text-[0.9rem] hover:bg-pill-bg ${isChecked ? "bg-accent-1/5 text-accent-1 font-medium" : "text-main"}`}
                  onClick={(e) => toggleSingleSelection(e, type, opt.value)}
                >
                  {isChecked ? (
                    <FaCheckSquare className="text-[1.1rem]" />
                  ) : (
                    <FaRegSquare className="text-muted text-[1.1rem]" />
                  )}
                  <span className="truncate">{opt.label}</span>
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
      {/* ✅ Parent ya Local Loading hone par Loader Show hoga */}
      {(loading || localLoading) && (
        <Loader fullScreen={true} text="Updating Layout..." />
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-5"
        ref={filtersRef}
      >
        {renderDropdown("Category", "category", categoriesList)}
        {renderDropdown("Difficulty", "difficulty", difficultiesList)}
        {renderSingleDropdown("Medium", "medium", [
          { label: "Both (Dual Medium)", value: "BOTH" },
          { label: "English Only", value: "EN" },
          { label: "Urdu Only", value: "UR" },
        ])}
        <LiveSearch
          value={filters.searchTerm}
          onChange={(text) =>
            setFilters((prev) => ({ ...prev, searchTerm: text }))
          }
        />
      </div>
    </>
  );
};

export default React.memo(MenuFilters);
