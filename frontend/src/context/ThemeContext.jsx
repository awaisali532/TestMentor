import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("app-theme") || "dark",
  );

  useEffect(() => {
    // Apply both data-theme attribute and dark class for 100% Tailwind v4 compatibility
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // ✅ Speed Optimization: Function ko cache kar liya
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // ✅ Speed Optimization: Value object ko cache kar liya
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
