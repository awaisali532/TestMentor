import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom"; // ✅ 1. Yeh import karein

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ 2. App ko BrowserRouter ke andar wrap kar dein */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
