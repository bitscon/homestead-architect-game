import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDebugLogger } from "./debug/logger";

if (import.meta.env.DEV) {
  initDebugLogger();
}

createRoot(document.getElementById("root")!).render(<App />);
