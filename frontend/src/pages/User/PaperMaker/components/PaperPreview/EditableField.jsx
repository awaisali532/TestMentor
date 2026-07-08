import React, { useRef, useState, useEffect } from "react";
// ✅ Global sanitizer import kiya hai (path adjust kar lena)
import { sanitizeHTML } from "../../../../../utils/sanitize";

const EditableField = ({
  value,
  onChange,
  isUrdu,
  isSmall,
  className = "",
}) => {
  const textRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleBlur = () => {
    if (textRef.current) {
      const rawHTML = textRef.current.innerHTML;
      const safeHTML = sanitizeHTML(rawHTML);

      if (safeHTML !== localValue) {
        setLocalValue(safeHTML);
        if (onChange) onChange(safeHTML);
      }
    }
  };

  const fontClasses = isUrdu
    ? "rtl font-urdu leading-relaxed"
    : "ltr font-sans";

  return (
    <span
      ref={textRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      dangerouslySetInnerHTML={{ __html: localValue }}
      className={`outline-none inline border-b border-transparent hover:border-dashed hover:border-gray-400 focus:border-solid focus:border-accent-1 transition-all empty:before:content-['Type_here...'] empty:before:text-gray-400 ${fontClasses} ${className}`}
      style={{ minWidth: isSmall ? "30px" : "auto", display: "inline-block" }}
    />
  );
};

export default EditableField;
