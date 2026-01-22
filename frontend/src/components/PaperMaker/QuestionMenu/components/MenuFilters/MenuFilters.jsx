import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaCheckSquare, FaRegSquare } from "react-icons/fa";
import TMLoader from "../../../../common/TMLoader/TMLoader"; // ✅ Import Loader
import "./MenuFilters.css";

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
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
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
        const areAllSelected = allOptions.every((opt) =>
          currentList.includes(opt),
        );
        newList = areAllSelected ? [] : [...allOptions];
      } else {
        const exists = currentList.some(
          (item) => String(item) === String(value),
        );
        newList = exists
          ? currentList.filter((item) => String(item) !== String(value))
          : [...currentList, value];
      }
      return { ...prev, [type]: newList };
    });
  };

  const renderCheckboxIcon = (isChecked) =>
    isChecked ? (
      <FaCheckSquare className="qm-check-icon checked" />
    ) : (
      <FaRegSquare className="qm-check-icon" />
    );

  const renderDropdown = (label, type, options) => {
    const safeOptions = options || [];
    const selected = filters[type] || [];
    const isOpen = openDropdown === type;

    const isAllSelected =
      safeOptions.length > 0 &&
      safeOptions.every((opt) => selected.includes(opt));

    return (
      <div className="qm-select-group" style={{ zIndex: isOpen ? 100 : 1 }}>
        <label>{label}</label>

        <div
          className={`qm-custom-select ${isOpen ? "active" : ""}`}
          onClick={() => setOpenDropdown(isOpen ? null : type)}
        >
          <span className="selected-text">
            {isAllSelected
              ? `All ${label}s Selected`
              : selected.length > 0
                ? `${selected.length} Selected`
                : "None Selected"}
          </span>
          <FaChevronDown className={`arrow-icon ${isOpen ? "rotate" : ""}`} />
        </div>

        {isOpen && (
          <div className="qm-dropdown-menu">
            <div
              className="qm-dropdown-item"
              onClick={(e) => toggleSelection(e, type, "ALL", safeOptions)}
            >
              {renderCheckboxIcon(isAllSelected)}
              <span>Select All</span>
            </div>
            <div className="qm-divider-h"></div>
            {safeOptions.map((opt) => {
              const isChecked = selected.some((s) => String(s) === String(opt));
              return (
                <div
                  key={opt}
                  className={`qm-dropdown-item ${
                    isChecked ? "active-item" : ""
                  }`}
                  onClick={(e) => toggleSelection(e, type, opt, safeOptions)}
                >
                  {renderCheckboxIcon(isChecked)}
                  <span>{opt.charAt(0) + opt.slice(1).toLowerCase()}</span>
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
      {/* ✅ LOADER HERE: Agar loading true hai, to ye Full Screen Loader dikhayega */}
      {loading && <TMLoader />}

      <div className="qm-filters" ref={filtersRef}>
        {renderDropdown("Category", "category", categoriesList)}
        {renderDropdown("Difficulty", "difficulty", difficultiesList)}
      </div>
    </>
  );
};

export default MenuFilters;
