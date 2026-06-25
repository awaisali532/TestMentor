import React, { createContext, useContext, useState, useMemo } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Speed Optimization: Value cached
  const value = useMemo(() => ({ isEditing, setIsEditing }), [isEditing]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);
