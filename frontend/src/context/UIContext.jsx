import React, { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Ye state puri app ko batayegi ke editing chal rahi hai ya nahi
  const [isEditing, setIsEditing] = useState(false);

  return (
    <UIContext.Provider value={{ isEditing, setIsEditing }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
