import React, { useState, useEffect, useRef } from "react";

const EditableField = ({ value, onChange, isUrdu, isSmall }) => {
  const [localValue, setLocalValue] = useState(value);
  const textRef = useRef(null);

  useEffect(() => setLocalValue(value), [value]);

  // ✅ AUTO-RESIZE LOGIC (Inputs will grow as you type, just like the video)
  useEffect(() => {
    if (!isSmall && textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = textRef.current.scrollHeight + "px";
    }
  }, [localValue, isSmall]);

  const handleBlur = () => {
    if (localValue !== value) onChange(localValue);
  };

  // ✅ INVISIBLE BORDERS UNTIL HOVER/CLICK
  const baseClasses =
    "block w-full min-w-0 bg-transparent border-2 border-transparent hover:border-dashed hover:border-gray-300 dark:hover:border-gray-600 focus:border-solid focus:border-accent-1 focus:bg-accent-1/5 outline-none print:hidden transition-all text-main placeholder-muted rounded resize-none m-0 p-1 -ml-1 overflow-hidden";

  const fontClasses = isUrdu
    ? "rtl font-[Jameel_Noori_Nastaleeq] text-[1.1rem] leading-relaxed"
    : "ltr font-sans text-[0.85rem]";

  return isSmall ? (
    <input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className={`w-[90%] text-[0.8rem] ${baseClasses} ${fontClasses}`}
    />
  ) : (
    <textarea
      ref={textRef}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      rows={1}
      style={{ verticalAlign: "top" }}
      className={`${baseClasses} ${fontClasses}`}
    />
  );
};

export default EditableField;
