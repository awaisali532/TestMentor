import React, { useState, useEffect, useRef } from "react";
import {
  FaChevronDown,
  FaSpinner,
  FaCheckSquare,
  FaRegSquare,
} from "react-icons/fa";
import "./MenuFilters.css";

const MenuFilters = ({
  filters,
  setFilters,
  categoriesList,
  difficultiesList,
  loading,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ROBUST TOGGLE LOGIC WITH DEBUGGING
  const toggleSelection = (e, type, value, allOptions) => {
    e.stopPropagation();

    console.log(`--- CLICKED: ${value} [${type}] ---`);

    setFilters((prev) => {
      // 1. Current Selected List Uthao
      const currentList = prev[type] || [];
      console.log("Current List Before:", currentList);

      let newList;

      if (value === "ALL") {
        // Logic: Agar saare pehle se selected hain to sab hata do, warna sab select kro
        const areAllSelected = allOptions.every((opt) =>
          currentList.includes(opt)
        );

        if (areAllSelected) {
          newList = []; // Deselect All
          console.log("Action: Unselecting ALL");
        } else {
          newList = [...allOptions]; // Select All
          console.log("Action: Selecting ALL");
        }
      } else {
        // Logic: Check kro value list mein hai ya nahi
        // Hum String comparison use karein ge taake koi whitespace ka masla na ho
        const exists = currentList.some(
          (item) => String(item) === String(value)
        );

        if (exists) {
          // Remove Item
          newList = currentList.filter(
            (item) => String(item) !== String(value)
          );
          console.log("Action: Removed", value);
        } else {
          // Add Item
          newList = [...currentList, value];
          console.log("Action: Added", value);
        }
      }

      console.log("New List:", newList);
      return { ...prev, [type]: newList };
    });
  };

  // Helper for Checkbox Icon
  const renderCheckboxIcon = (isChecked) => {
    return isChecked ? (
      <FaCheckSquare className="qm-check-icon checked" />
    ) : (
      <FaRegSquare className="qm-check-icon" />
    );
  };

  // --- Render Dropdown ---
  const renderDropdown = (label, type, options) => {
    const safeOptions = options || [];
    const selected = filters[type] || [];

    // Check All Logic: Kya saare options selected list mein hain?
    const isAllSelected =
      safeOptions.length > 0 &&
      safeOptions.every((opt) => selected.includes(opt));

    const isOpen = openDropdown === type;

    return (
      <div className="qm-select-group" ref={dropdownRef}>
        <label>{label}</label>

        {/* Trigger Button */}
        <div
          className={`qm-custom-select ${isOpen ? "active" : ""}`}
          onClick={() => !loading && setOpenDropdown(isOpen ? null : type)}
        >
          <span className="selected-text">
            {loading ? (
              <span className="flex-center">
                <FaSpinner className="spin" /> Loading...
              </span>
            ) : isAllSelected ? (
              `All ${label}s Selected`
            ) : selected.length > 0 ? (
              `${selected.length} Selected`
            ) : (
              "None Selected"
            )}
          </span>
          <FaChevronDown className={`arrow-icon ${isOpen ? "rotate" : ""}`} />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="qm-dropdown-menu">
            {/* Select All Option */}
            <div
              className="qm-dropdown-item"
              onClick={(e) => toggleSelection(e, type, "ALL", safeOptions)}
            >
              {renderCheckboxIcon(isAllSelected)}
              <span>Select All</span>
            </div>

            <div className="qm-divider-h"></div>

            {/* Individual Options */}
            {safeOptions.map((opt) => {
              // Strict Check: Kya ye option selected list mein hai?
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
    <div className="qm-filters">
      {renderDropdown("Category", "category", categoriesList)}
      {renderDropdown("Difficulty", "difficulty", difficultiesList)}
    </div>
  );
};

export default MenuFilters;
