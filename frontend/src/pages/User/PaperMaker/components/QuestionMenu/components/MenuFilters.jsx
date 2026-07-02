import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaCheckSquare, FaRegSquare } from "react-icons/fa";
// ✅ FIX: Path corrected and using our new Loader
import Loader from "../../../../../../components/ui/Loader";

const MenuFilters = ({
  filters,
  setFilters,
  categoriesList,
  difficultiesList,
  loading,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target))
        setOpenDropdown(null);
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
          className={`px-4 py-3 rounded-xl border bg-bg-body text-main text-[0.9rem] cursor-pointer flex justify-between items-center transition-all select-none ${isOpen ? "border-accent-1 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" : "border-border hover:border-accent-1 hover:bg-pill-bg"}`}
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
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-50 max-h-75 overflow-y-auto animate-fade-in custom-scrollbar">
            {safeOptions.length > 0 ? (
              <>
                <div
                  className="px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors text-main text-[0.9rem] select-none hover:bg-pill-bg"
                  onClick={(e) => toggleSelection(e, type, "ALL", safeOptions)}
                >
                  {isAllSelected ? (
                    <FaCheckSquare className="text-[1.1rem] text-accent-1 min-w-4.5" />
                  ) : (
                    <FaRegSquare className="text-[1.1rem] text-muted min-w-4.5" />
                  )}
                  <span>Select All</span>
                </div>
                <div className="h-px bg-border mx-0"></div>
                {safeOptions.map((opt, index) => {
                  const value = typeof opt === "object" ? opt.value : opt;
                  const displayLabel =
                    typeof opt === "object" ? opt.label : opt;
                  const isChecked = selected.includes(value);

                  return (
                    <div
                      key={index}
                      className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors text-main text-[0.9rem] select-none hover:bg-pill-bg ${isChecked ? "bg-accent-1/5" : ""}`}
                      onClick={(e) =>
                        toggleSelection(e, type, value, safeOptions)
                      }
                    >
                      {isChecked ? (
                        <FaCheckSquare className="text-[1.1rem] text-accent-1 min-w-4.5" />
                      ) : (
                        <FaRegSquare className="text-[1.1rem] text-muted min-w-4.5" />
                      )}
                      <span className="truncate">{displayLabel}</span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="px-4 py-3 text-center text-muted italic text-[0.9rem]">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ✅ FIX: Native fullScreen loader with our actual UI Loader */}
      {loading && <Loader fullScreen={true} text="Applying Filters..." />}
      <div className="flex gap-5 mb-5" ref={filtersRef}>
        {renderDropdown("Category", "category", categoriesList)}
        {renderDropdown("Difficulty", "difficulty", difficultiesList)}
      </div>
    </>
  );
};

export default React.memo(MenuFilters);
