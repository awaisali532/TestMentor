import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaCheckSquare, FaRegSquare } from "react-icons/fa";
import TMLoader from "../../../../common/TMLoader/TMLoader";
import "./MenuFilters.css";

const MenuFilters = ({
  filters,
  setFilters,
  categoriesList, // Ye ab Array of Objects hai [{value, label}]
  difficultiesList, // Ye Array of Strings hai ["Easy", "Medium"]
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

      // "Select All" Logic
      if (value === "ALL") {
        // Hamein values compare krni hain objects ki nahi
        const allValues = allOptions.map((opt) =>
          typeof opt === "object" ? opt.value : opt,
        );

        const areAllSelected = allValues.every((val) =>
          currentList.includes(val),
        );
        newList = areAllSelected ? [] : [...allValues];
      }
      // Individual Select Logic
      else {
        const exists = currentList.includes(value);
        newList = exists
          ? currentList.filter((item) => item !== value)
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
    const safeOptions = Array.isArray(options) ? options : [];
    const selected = filters[type] || [];
    const isOpen = openDropdown === type;

    // Check "All Selected"
    const isAllSelected =
      safeOptions.length > 0 &&
      safeOptions.every((opt) => {
        const val = typeof opt === "object" ? opt.value : opt;
        return selected.includes(val);
      });

    return (
      <div className="qm-select-group" style={{ zIndex: isOpen ? 100 : 1 }}>
        <label>{label}</label>

        <div
          className={`qm-custom-select ${isOpen ? "active" : ""}`}
          onClick={() => setOpenDropdown(isOpen ? null : type)}
        >
          <span className="selected-text">
            {isAllSelected
              ? `All ${label}s`
              : selected.length > 0
                ? `${selected.length} Selected`
                : "None Selected"}
          </span>
          <FaChevronDown className={`arrow-icon ${isOpen ? "rotate" : ""}`} />
        </div>

        {isOpen && (
          <div className="qm-dropdown-menu">
            {safeOptions.length > 0 ? (
              <>
                <div
                  className="qm-dropdown-item"
                  onClick={(e) => toggleSelection(e, type, "ALL", safeOptions)}
                >
                  {renderCheckboxIcon(isAllSelected)}
                  <span>Select All</span>
                </div>
                <div className="qm-divider-h"></div>

                {safeOptions.map((opt, index) => {
                  // Handle Object vs String
                  const isObject = typeof opt === "object";
                  const value = isObject ? opt.value : opt;
                  const displayLabel = isObject ? opt.label : opt;

                  const isChecked = selected.includes(value);

                  return (
                    <div
                      key={index}
                      className={`qm-dropdown-item ${isChecked ? "active-item" : ""}`}
                      onClick={(e) =>
                        toggleSelection(e, type, value, safeOptions)
                      }
                    >
                      {renderCheckboxIcon(isChecked)}
                      <span className="qm-opt-label">{displayLabel}</span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="qm-dropdown-empty">No options available</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {loading && <TMLoader />}
      <div className="qm-filters" ref={filtersRef}>
        {renderDropdown("Category", "category", categoriesList)}
        {renderDropdown("Difficulty", "difficulty", difficultiesList)}
      </div>
    </>
  );
};

export default MenuFilters;
