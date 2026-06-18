import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "katex/dist/katex.min.css";
import "bootstrap/dist/css/bootstrap.css"; // ✅ Sirf ye use karein map error se bachne ke liye
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
